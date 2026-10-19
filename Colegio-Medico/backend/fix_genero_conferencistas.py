# -*- coding: utf-8 -*-
"""
1) Pone conferencista='NC' a todos los usuarios marcados como 'C'.
2) Corrige genero SOLO cuando la evidencia es confiable:
   - Nombre conocido en listas curadas (M/F).
   - Patrones compuestos (Maria X -> F salvo X masculino; Jose X masculino -> M).
   - Normaliza acentos (Maria == María, Jose == José).
   - Nada de heuristica por terminacion de palabra.
Ejecutar:  python fix_genero_conferencistas.py            (solo reporte)
           python fix_genero_conferencistas.py --aplicar  (escribe en DB)
"""
import os
import sys
import unicodedata
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'colegio_backend.settings')
django.setup()

from django.contrib.auth.models import User


def norm(t):
    t = t.strip('.,').lower()
    return ''.join(c for c in unicodedata.normalize('NFD', t) if unicodedata.category(c) != 'Mn')


# ---------- Nombres MASCULINOS conocidos ----------
M_NOMBRES = {
    'ender','andres','alejandro','remberto','joel','ali','guillermo','jorge','nestor','nerio',
    'eydelver','carlos','daniel','miguel','jesus','ricardo','diego','biagio','rodolfo',
    'darian','wilmer','robert','angel','giovanny','eduardo','salvador','ruben','alberto','raul',
    'pedro','pablo','luis','juan','pompeyo','gilmar','segundo','manuel','ivan','leonardo','gustavo',
    'alessandro','yoendris','everto','julian','senen','edixon','camilo','brayan','ulfrank','joseph',
    'heberto','dreibert','junaidy','deivinson','sebastian','julio','merwe','yendriek','yiferson','domingo',
    'gerardo','reinaldo','antonio','edwin','otmar','wilfredo','felix','oscar','freddy','enrique','rafael',
    'antony','yhon','humberto','tomas','edgardo','julior','jhon','oswaldo','omar','douglas','jonathan',
    'ronaldo','alberth','david','yulier','alfredo','ramon','rener','cesar','yimmy','freimay','yostin',
    'alexi','orlando','dervis','alvaro','leonel','edgar','yhonathan','freider','edelso','lisandro',
    'reinerio','yonathan','endry','german','alexander','moises','nelson','israel','hugo','emiro',
    'doyler','sergio','jack','tito','harold','franklin','marcoa','zaim','haslin','esteban','fabian',
    'junior','marcial','santiago','valentin','leonardy','berkis','zaimbeth','elias','vicente','eusebio',
    'edinson','luismar','argenis','javier','erik','kevin','dylan',
    'dario','maikel','yeison','kervin','josemaria','maximo','edgaralexander','gustavoadolfo','humbertojose',
    'jorgeantonio','luisfernando','jesusmanuel','josegabriel','josegregorio','luisenrique','pedropablo',
    'eduardojose','carlosalberto','joseantonio','josejesus','josevicente','rubendario','nelsonjose',
    'luisjose','josedavid','alejandrojose','edgarjose','oscarjose','josegregory','josecarlos','willmer',
    'herson','josearmando','freddyjose','dennys','yonnhy','maikeljose','emerson','yeferson','keiner',
    'johansel','dilsone','jhonfreddy','ernesto','alirio','germanjose','vicentepablo','orlandojesus',
    'freyder','lizsanchez','offir',
    'darian',
}

# ---------- Nombres FEMENINOS conocidos ----------
F_NOMBRES = {
    'janett','milagros','genesis','liliana','gloria','edeanny','susana','naibet','vicenta','luisa','tatiana',
    'hilda','romileth','hiliana','ivania','claudia','alejandra','ana','mengly','dylianis','sindy','niximara',
    'saily','roxana','jetsy','endimar','nicolle','yiselle','betty','alaine','laura','astricd','sandra',
    'alvileidy','lina','keily','keilymar','sarai','luzleanellat','lena','jakeline','mariana','marianasue',
    'anam','monica','reymelis','yolanda','america','yarisbeth','yahendis','karina','katherine','anays',
    'jocyline','carolina','cindy','keila','samia','melani','stiphani','isabel','julim','marialaura',
    'lorena','karem','dayana','dyanna','nohora','maite','samantha','raiza','nubis','yadira','edilma',
    'yelitza','yulimar','aleida','yeimy','yerlin','angela','yoleida','yuraima','nancy','nirenis','rebeca',
    'jenifer','addirys','daniela','mery','dioleida','wendy','camila','angie','karelys','leidy','geomara',
    'mariangela','marian','nicole','xiordalin','olga','karol','elena','adriana','barbara','wen','nayibe',
    'gina','luisana','jairym','jairymar','deliana','esther','dany','weiimali','sorangel','elva','freimary',
    'consuelo','johana','mariany','kathe','iraliz','jesiel','lauren','estefani','yiseth',
    'mayelin','silvia','mercedes','beatriz','magly',
    'marisela','elizabeth','maria','mariangel','mariangelica','gabriela','laysbel',
    'ines','virginia','nora','veronica','iremar','anyifer','yurley','nohely','dilia',
    'marlyn','heverlyn','dalis','valery','yennis','aibi','iskenderlin','thaelis','karla',
    'lucy','migdalis','rosangel','thiffani','andreina','alessandra','darlyn',
    'angelis','jacqueline','airam','yenaibith','nathyuska','valentina','natalia','yurianys','dinaura',
    'rosildre','gredi','katerine','linda','emilianny','vanessa','dalila',
    'raquel','andreyna','karen','carmen','vivianna',
    'irienimairena','mariela','jhennifer','maira','irisnaicideth',
    'chiquinquira','angeles','karilu','nereida','yovana','orleany',
    'yusbely','yaritza','gredys','yusmery','karelis','mariang',
    'greidy','lismar','nadiurka','lisbeht','yorlenys','wuiylinis','victoriannys',
    'yolizmar','junaidy','jassay','janet','yeidryel','wilmarys','yury',
    'yosmary','gisel','mariafernanda','zaira','haidy','johanna',
    'kaleth','yohana','anairis','saraizulema','yuly','hannia','gabycarmen',
    'nereyda','ysbeli','rocio','sofia','valeria','victoria','paula',
    'clarajose','leircys','josenia','norka','elsa','erica','iveth','yurbely','judith','mariaester',
    'cristinamar','josefa','eva','mariaangelica','marialourdes','nayla','lucianamaria',
    'yasmil','yulis','heidy','nathselli','estefany','zuleyma','susej',
    'mariapuente','lilianagonzalez','milagrossierra','diliacalderon','dianabeleno','yenifferfinol',
    'mariaaldana','kelly','sulay','carina','amny','gabrielacontreras','katy','michelle','johevanis',
    'karennava','vilma','vilmapadron','clareth','mayela','laura2','lalorena',
    'mariajose','maryjose','mariaalejandra','rosmary','celis','patricia','anabel','meribel','guadalupe',
    'ingrid','vicmar','giselle','alejandrina',
    'yulianny','estefaniadriana','estercarmen','briceidy','josselyn','kellycarolina','maikelis',
}

# Maria seguido de uno de estos => MASCULINO (Maria Jose, Maria Fernando, etc.)
M_DESPUES_DE_MARIA = {
    'jose','jesus','fernando','guillermo','gabriel','antonio','carlos','manuel','alejandraprohibido',
    'eugenio','luis','miguel','rafael','eduardo',
}
M_DESPUES_DE_MARIA.discard('alejandraprohibido')

# Jose seguido de uno de estos => MASCULINO
M_DESPUES_DE_JOSE = {
    'jose','jesus','manuel','luis','antonio','carlos','miguel','david','eduardo','rafael','fernando',
    'alejandro','gabriel','gregorio','vicente','armando','enrique','alfredo','ramon','felipe','tomas',
    'gregory','vicente','david','joaquin','miguelon','alexander',
}
# Jose seguido de esto => FEMENINO (Jose del Carmen / Jose Maria en uso femenino raro)
F_DESPUES_DE_JOSE = {'del','de','los','carmen','angeles','antonia','dolores'}

def toks(fullname):
    return [norm(t) for t in (fullname or '').strip().split() if norm(t)]

def clasificar_persona(fullname):
    T = toks(fullname)
    if not T:
        return None
    # 0) el PRIMER nombre manda: si esta en alguna lista, gana
    t0 = T[0]
    if t0 in F_NOMBRES and t0 not in M_NOMBRES:
        return 'F'
    if t0 in M_NOMBRES and t0 not in F_NOMBRES:
        return 'M'
    # 1) nombre femenino conocido en cualquier posicion
    for t in T:
        if t in F_NOMBRES:
            return 'F'
    # 2) nombre masculino conocido en cualquier posicion
    for i, t in enumerate(T):
        if t in M_NOMBRES:
            # "Maria Jose"-like: si el masculino esta precedido por Maria y es de los ambiguos
            if i > 0 and T[i-1] == 'maria' and t in {'jose','jesus'}:
                continue
            return 'M'
    # 3) patrones compuestos con Maria / Jose
    for i, t in enumerate(T):
        if t == 'maria':
            nxt = T[i+1] if i + 1 < len(T) else None
            if nxt is None:
                return 'F'
            if nxt in M_DESPUES_DE_MARIA:
                return 'M'
            return 'F'
        if t == 'jose':
            nxt = T[i+1] if i + 1 < len(T) else None
            if nxt is None:
                return 'M'
            if nxt in M_DESPUES_DE_JOSE:
                return 'M'
            if nxt in F_DESPUES_DE_JOSE:
                return 'F'
            return None
    return None

def main():
    aplicar = '--aplicar' in sys.argv
    print(f"Modo: {'APLICAR' if aplicar else 'REPORTE'}")
    print()

    confs = list(User.objects.filter(perfil__conferencista='C'))
    print(f"--- CONFERENCISTAS ('C' -> 'NC'): {len(confs)} ---")
    for u in confs:
        print(f"   {u.username} | {u.first_name}")

    from usuario.models import PerfilUsuario
    a_corregir = []
    dudosos = []
    for p in PerfilUsuario.objects.select_related('user'):
        u = p.user
        g = p.genero
        guess = clasificar_persona(u.first_name)
        if g in ('M','F') and guess is not None and g != guess:
            a_corregir.append((u.username, u.first_name, g, guess))
        elif g not in ('M','F'):
            if guess is not None:
                a_corregir.append((u.username, u.first_name, g or '-', guess))
            else:
                dudosos.append((u.username, u.first_name, g))

    print(f"\n--- GENERO a corregir: {len(a_corregir)} ---")
    for r in a_corregir:
        print(f"   {r[0]} | {r[1]} | actual={r[2]} -> nuevo={r[3]}")

    print(f"\n--- DUDOSOS (no se tocan): {len(dudosos)} ---")
    for r in dudosos:
        print(f"   {r[0]} | {r[1]} | genero_actual={r[2]}")

    if not aplicar:
        print("\n>>> DRY-RUN: nada modificado. Re-ejecutar con --aplicar.")
        return

    nc = 0
    for u in confs:
        u.perfil.conferencista = 'NC'
        u.perfil.save(update_fields=['conferencista'])
        nc += 1

    ng = 0
    for uname, fn, viejo, nuevo in a_corregir:
        u = User.objects.get(username=uname)
        p = getattr(u, 'perfil', None)
        if p:
            p.genero = nuevo
            p.save(update_fields=['genero'])
            ng += 1

    print(f"\nOK: {nc} conferencistas -> 'NC'; {ng} generos corregidos.")

if __name__ == '__main__':
    main()
