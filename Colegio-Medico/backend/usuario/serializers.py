# from django.contrib.auth import authenticate
# from django.contrib.auth.models import User, Group
# from rest_framework import serializers
# from .models import PerfilUsuario

# from .utils import enviar_confirmacion_registro

# def get_user_role(user) -> str:
#     if getattr(user, "is_superuser", False):
#         return "superadmin"
#     try:
#         groups_qs = user.groups.all().order_by("name")
#         first_group = groups_qs.first()
#         if first_group:
#             return first_group.name
#     except Exception:
#         pass
#     if getattr(user, "is_staff", False):
#         return "staff"
#     return "participante"


# class LoginSerializer(serializers.Serializer):
#     username = serializers.CharField(required=True, trim_whitespace=True)
#     password = serializers.CharField(required=True, trim_whitespace=False, write_only=True)

#     def validate(self, attrs):
#         username = attrs.get("username")
#         password = attrs.get("password")
#         request = self.context.get("request")

#         user = authenticate(request=request, username=username, password=password)
#         if not user:
#             raise serializers.ValidationError("Credenciales inválidas.")
#         if not user.is_active:
#             raise serializers.ValidationError("Usuario inactivo.")

#         attrs["user"] = user
#         return attrs


# class UserListSerializer(serializers.ModelSerializer):
#     rol = serializers.SerializerMethodField()
#     tipo = serializers.CharField(source='perfil.tipo', read_only=True)
#     cedula = serializers.CharField(source='perfil.cedula', read_only=True)
#     telefono = serializers.CharField(source='perfil.telefono', read_only=True)
#     genero = serializers.CharField(source='perfil.genero', read_only=True)

#     class Meta:
#         model = User
#         fields = ['id', 'username', 'first_name', 'last_name', 'email', 'rol', 'tipo', 'cedula', 'telefono', 'genero', 'is_active']

#     def get_rol(self, obj):
#         return get_user_role(obj)


# class EmployeeCreateUpdateSerializer(serializers.ModelSerializer):
#     rol = serializers.CharField(write_only=True, required=False, default="participante")
#     tipo = serializers.CharField(write_only=True, required=True)
#     password = serializers.CharField(write_only=True, required=False)

#     nacionalidad = serializers.CharField(write_only=True, required=False)
#     cedula = serializers.CharField(write_only=True, required=False)
#     telefono = serializers.CharField(write_only=True, required=False)
#     comezu = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
#     especialidad = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
#     genero = serializers.CharField(write_only=True, required=False)

#     class Meta:
#         model = User
#         fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'rol', 'tipo',
#                   'nacionalidad', 'cedula', 'telefono', 'comezu', 'especialidad', 'genero', 'sociedad', 'conferencista', 'is_active']

#     def validate_username(self, value):
#         qs = User.objects.filter(username__iexact=value)
#         if self.instance:
#             qs = qs.exclude(pk=self.instance.pk)
#         if qs.exists():
#             raise serializers.ValidationError("Este nombre de usuario ya se encuentra registrado.")
#         if " " in value:
#             raise serializers.ValidationError("El nombre de usuario no puede contener espacios.")
#         return value

#     # --- NUEVAS VALIDACIONES DE UNICIDAD ADAPTADAS ---

#     def validate_email(self, value):
#         if value:
#             qs = User.objects.filter(email__iexact=value)
#             if self.instance:
#                 qs = qs.exclude(pk=self.instance.pk)
#             if qs.exists():
#                 raise serializers.ValidationError("Ya este correo electrónico está registrado.")
#         return value

#     def validate_cedula(self, value):
#         if value:
#             qs = PerfilUsuario.objects.filter(cedula=value)
#             if self.instance:
#                 qs = qs.exclude(user_id=self.instance.pk)
#             if qs.exists():
#                 raise serializers.ValidationError("Ya esta identificación se encuentra registrada.")
#         return value

#     def validate_comezu(self, value):
#         if value:
#             qs = PerfilUsuario.objects.filter(comezu=value)
#             if self.instance:
#                 qs = qs.exclude(user_id=self.instance.pk)
#             if qs.exists():
#                 raise serializers.ValidationError("Ya este número de COMEZU se encuentra registrado.")
#         return value

#     # ------------------------------------------------

#     def validate(self, attrs):
#         tipo = attrs.get('tipo')
#         if tipo == 'E':
#             attrs['comezu'] = None
#             attrs['especialidad'] = None
#         return attrs

#     def create(self, validated_data):
#         rol_name = validated_data.pop('rol', 'participante')
#         password = validated_data.pop('password', None)

#         correo_destino = validated_data.get('email')

#         perfil_fields = {
#             'tipo': validated_data.pop('tipo'),
#             'nacionalidad': validated_data.pop('nacionalidad', 'V'),
#             'cedula': validated_data.pop('cedula', None),
#             'telefono': validated_data.pop('telefono', None),
#             'comezu': validated_data.pop('comezu', None),
#             'especialidad': validated_data.pop('especialidad', None),
#             'genero': validated_data.pop('genero', None),
#             'conferencista': validated_data.pop('conferencista', None),
#         }

#         user = User.objects.create_user(**validated_data)
#         if password:
#             user.set_password(password)
#             user.save()

#         grupo, _ = Group.objects.get_or_create(name=rol_name)
#         user.groups.add(grupo)

#         PerfilUsuario.objects.create(user=user, **perfil_fields)

#         # 🌟 CORRECCIÓN: Quitamos la obligación estricta de first_name y last_name para el disparo
#         if correo_destino:
#             try:
#                 # Si no hay nombre/apellido nativo guardado todavía, usamos el username como respaldo
#                 nombre_correo = user.first_name or user.username
#                 apellido_correo = user.last_name or ""

#                 enviar_confirmacion_registro(correo_destino, nombre_correo, apellido_correo)
#             except Exception as e:
#                 print(f'No se pudo enviar el correo de confirmación: {e}')

#         return user

#     def update(self, instance, validated_data):
#         rol_name = validated_data.pop('rol', None)
#         password = validated_data.pop('password', None)

#         perfil_data = {
#             'tipo': validated_data.pop('tipo', None),
#             'nacionalidad': validated_data.pop('nacionalidad', None),
#             'cedula': validated_data.pop('cedula', None),
#             'telefono': validated_data.pop('telefono', None),
#             'comezu': validated_data.pop('comezu', None),
#             'especialidad': validated_data.pop('especialidad', None),
#             'genero': validated_data.pop('genero', None),
#             'conferencista': validated_data.pop('conferencista', None),
#         }

#         for attr, value in validated_data.items():
#             setattr(instance, attr, value)
#         if password:
#             instance.set_password(password)
#         instance.save()

#         perfil, _ = PerfilUsuario.objects.get_or_create(user=instance)
#         for attr, value in perfil_data.items():
#             if value is not None:
#                 setattr(perfil, attr, value)
#         perfil.save()

#         if rol_name:
#             instance.groups.clear()
#             grupo, _ = Group.objects.get_or_create(name=rol_name)
#             instance.groups.add(grupo)

#         return instance

from django.contrib.auth import authenticate
from django.contrib.auth.models import User, Group
from rest_framework import serializers
from .models import PerfilUsuario
from .utils import enviar_confirmacion_registro

def get_user_role(user) -> str:
    if getattr(user, "is_superuser", False):
        return "superadmin"
    try:
        # IMPORTANTE: no usar .order_by("name").first() aquí, porque fuerza una
        # consulta nueva por cada usuario (N+1) y anula el prefetch_related.
        # Ordenamos en Python para aprovechar el caché del prefetch_related.
        grupos = list(user.groups.all())
        if grupos:
            return min(grupos, key=lambda g: g.name).name
    except Exception:
        pass
    if getattr(user, "is_staff", False):
        return "staff"
    return "participante"


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True, trim_whitespace=True)
    password = serializers.CharField(required=True, trim_whitespace=False, write_only=True)

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")
        request = self.context.get("request")

        user = authenticate(request=request, username=username, password=password)
        if not user:
            raise serializers.ValidationError("Credenciales inválidas.")
        if not user.is_active:
            raise serializers.ValidationError("Usuario inactivo.")

        attrs["user"] = user
        return attrs


class UserListSerializer(serializers.ModelSerializer):
    rol = serializers.SerializerMethodField()
    tipo = serializers.CharField(source='perfil.tipo', read_only=True)
    cedula = serializers.CharField(source='perfil.cedula', read_only=True)
    telefono = serializers.CharField(source='perfil.telefono', read_only=True)
    genero = serializers.CharField(source='perfil.genero', read_only=True)

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'rol', 'tipo', 'cedula', 'telefono', 'genero', 'is_active']

    def get_rol(self, obj):
        return get_user_role(obj)

    @classmethod
    def optimizar_queryset(cls, queryset):
        """Queryset con prefetchs para listar usuarios sin N+1 queries."""
        return queryset.select_related('perfil').prefetch_related('groups')


class EmployeeCreateUpdateSerializer(serializers.ModelSerializer):
    rol = serializers.CharField(write_only=True, required=False, default="participante")
    tipo = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=False)

    nacionalidad = serializers.CharField(write_only=True, required=False)
    cedula = serializers.CharField(write_only=True, required=False)
    telefono = serializers.CharField(write_only=True, required=False)
    comezu = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    especialidad = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    genero = serializers.CharField(write_only=True, required=False)
    sociedad = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    # 🌟 CORRECCIÓN: Declaramos conferencista para que DRF no lo busque dentro del modelo User
    conferencista = serializers.CharField(write_only=True, required=False, default="NC")

    class Meta:
        model = User
        fields = ['id', 'username', 'password', 'first_name', 'last_name', 'email', 'rol', 'tipo',
                  'nacionalidad', 'cedula', 'telefono', 'comezu', 'especialidad', 'genero', 'sociedad', 'conferencista', 'is_active']

    def validate_username(self, value):
        qs = User.objects.filter(username__iexact=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Este nombre de usuario ya se encuentra registrado.")
        if " " in value:
            raise serializers.ValidationError("El nombre de usuario no puede contener espacios.")
        return value

    def validate_email(self, value):
        if value:
            qs = User.objects.filter(email__iexact=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("Ya este correo electrónico está registrado.")
        return value

    def validate_cedula(self, value):
        if value:
            qs = PerfilUsuario.objects.filter(cedula=value)
            if self.instance:
                qs = qs.exclude(user_id=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("Ya esta identificación se encuentra registrada.")
        return value

    def validate_comezu(self, value):
        if value:
            qs = PerfilUsuario.objects.filter(comezu=value)
            if self.instance:
                qs = qs.exclude(user_id=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("Ya este número de COMEZU se encuentra registrado.")
        return value

    def validate_telefono(self, value):
        """Formato internacional: +<código país><número>. El número sin el código
        debe tener entre 6 y 15 dígitos (estándar E.164)."""
        if value:
            import re
            if not re.fullmatch(r'\+\d{7,18}', value):
                raise serializers.ValidationError(
                    "El teléfono debe tener formato +<código país><número>, con entre 6 y 15 dígitos sin contar el código."
                )
        return value

    def validate(self, attrs):
        tipo = attrs.get('tipo')
        if tipo == 'E':
            attrs['comezu'] = None
            attrs['especialidad'] = None
        return attrs

    def create(self, validated_data):
        rol_name = validated_data.pop('rol', 'participante')
        password = validated_data.pop('password', None)
        correo_destino = validated_data.get('email')

        perfil_fields = {
            'tipo': validated_data.pop('tipo'),
            'nacionalidad': validated_data.pop('nacionalidad', 'V'),
            'cedula': validated_data.pop('cedula', None),
            'telefono': validated_data.pop('telefono', None),
            'comezu': validated_data.pop('comezu', None),
            'especialidad': validated_data.pop('especialidad', None),
            'genero': validated_data.pop('genero', None),
            'sociedad': validated_data.pop('sociedad', None) or None,
            'conferencista': validated_data.pop('conferencista', 'NC'), # Captura el valor correcto
        }

        user = User.objects.create_user(**validated_data)
        if password:
            user.set_password(password)
            user.save()

        grupo, _ = Group.objects.get_or_create(name=rol_name)
        user.groups.add(grupo)

        # Se crea el perfil amarrado al usuario
        PerfilUsuario.objects.create(user=user, **perfil_fields)

        # 🌟 LOGICA MEJORADA: Se envía el correo usando respaldos por si first_name viene vacío
        if correo_destino:
            try:
                nombre = user.first_name or user.username
                apellido = user.last_name or ""
                enviar_confirmacion_registro(correo_destino, nombre, apellido)
            except Exception as e:
                print(f'No se pudo enviar el correo de confirmación: {e}')

        return user

    def update(self, instance, validated_data):
        rol_name = validated_data.pop('rol', None)
        password = validated_data.pop('password', None)

        perfil_data = {
            'tipo': validated_data.pop('tipo', None),
            'nacionalidad': validated_data.pop('nacionalidad', None),
            'cedula': validated_data.pop('cedula', None),
            'telefono': validated_data.pop('telefono', None),
            'comezu': validated_data.pop('comezu', None),
            'especialidad': validated_data.pop('especialidad', None),
            'genero': validated_data.pop('genero', None),
            'sociedad': validated_data.pop('sociedad', None),
            'conferencista': validated_data.pop('conferencista', None),
        }

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()

        perfil, _ = PerfilUsuario.objects.get_or_create(user=instance)
        for attr, value in perfil_data.items():
            if value is not None:
                setattr(perfil, attr, value)
        perfil.save()

        if rol_name:
            instance.groups.clear()
            grupo, _ = Group.objects.get_or_create(name=rol_name)
            instance.groups.add(grupo)

        return instance





# {
#     "username": "jesus_doc",
#     "password": "ClaveSegura123*",
#     "first_name": "Jesús",
#     "last_name": "Zabala",
#     "email": "tu_correo_prueba@gmail.com",
#     "rol": "participante",
#     "tipo": "D",
#     "nacionalidad": "V",
#     "cedula": "V-28123456",
#     "telefono": "04121234567",
#     "comezu": "CMZ-8594",
#     "especialidad": "Cardiología",
#     "genero": "M",
#     "conferencista": "C",
#     "is_active": true
# }