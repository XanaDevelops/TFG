# Diario de bicátora

## xx/02
Configurar portatil, no va agarrar

## 25/02
Se ha conseguido utilizar ammo.js para las fisicas, con algo de ayuda de IA a la hora de leer documentación (si hay...), verificar codigo directamente sobre la libreria, se puede agarrar un cubo
(con suerte cualquier objeto fisico) de forma intuitiva:
- la mano atraviesa los objetos
- al agarrar se hace un constraint manualmente
- se puede mover el objeto mientras se agarra
- al soltar se libera el constraint

### todo
- efectos visuales
- refactorizar codigo
- entorno de testing

## 28/02
Se ha importado el resto de modelos 3D

### 04/03
Se ha refactorizado codigo
Ahora solo agarras con "grip" (el de abajo)
El raycast detecta correctamente elementos .grababble

TODO:
- agarrar y atraer a la posición
- Feedback visual
- Diferencias elementos solo agarrables de atraibles (tambien)
TOFIX:
- Hitbox de agarre

### 06/03
agarrar distancia
TOFIX:
atravesar suelo si lo fuerzas

### 09/03
Al agarrar objetos a distancia, se puede atraer a la posición de la mano, por ahora es un tp.
Uso de IA para resolver un bug respecto a la actualización de posiciones respecto a la fisica de AMMOjs i metodos de THREEjs

Se ha, usando Anime.js, a traves de AFRAME.ANIME, animar la atracción del elemento, pero por razones ni la IA puede arreglar que la primera atracción se desacople malla y collider, por lo que de alguna manera se tiene que parchear.

TODO:
- Feedback visual
- Diferencias elementos solo agarrables de atraibles
- Respawn barrier

TOFIX:
- Hitbox de agarre
- Bug animación
- Si mueves la mano durante la animación queda raro

16/3
Arreglado el bug del primer agarre, la solución (chpauza) pasa por pasar a kinematic y despues a dynamic con intervalos, suficientes para que arranque el motor de fisicas y detecte el cambio
Se ha añadido un debug para ver el estado del ammo-body
Se ha añadido el codigo de la death barrier, aunque no está del todo configurado
Se ha usado un metodo manual de interpolación para que el cubo vaya a la posición actual de la mano, no estrictamente la posición inicial de cuando se agarra.

TODO:
- Feedback visual
- Diferenciar objetos agarrables, tambien de los atraibles
- Respawn barrier
- QoL agarre

TOFIX:
- hitbox de agarre


18/03
Se ha creado el componente de death-barrier.
Se ha usado IA para ayuda en la resolución de bugs (aunque la mitad de estos era no haber importado el archivo del componente...)
Se ha creado Mixins para las manos y objetos agarrables

Se ha detectado que objetos muy rapidos atraviesan la death barrier, se puede:
- Hacer que los objetos vayan en fisicas continuas (ahora son discretas)
- Aprovechar grab-fix para mirar si el objeto esta en el subsuelo y < -algo

Por ahora se han aumentado parametros de rendimiento sin mejora aparente en este aspecto

A veces el fix no funciona a la primera, hay que recargar la pagina (no se si esto es por el live server o en un entorno desplegado pasará igual...)

Tambien se ha añadido el objeto de "tap"

Se tiene que investigar los ammo-shapes, hull por defecto, hadc y vhadc para figuras no estaticas con agujeros (que interese pasar cosas por ahí)
TODO:
- Feedback visual
- QoL agarre
- Diferenciar objetos
- Componente trigger para ammo.js

TOFIX:
- hitbox de agarre
- objetos muy rapidos 

19/03

Resulta que con hadc funciona bien
Añadido mixin de deathBarrier y envuelto el entorno en paredes de este tipo
(para esto ultimo se ha usado IA para hacer de copia pega mejorado)


TODO:
- Feedback visual
- QoL agarre
- Diferenciar objetos
- Componente trigger para ammo.js

TOFIX:
- hitbox de agarre
- objetos muy rapidos (arreglado)

## 20/03
añadido debug-hud para mostrar los logs por consola en el entorno de VR, ayudará para el debug


TODO:
- Feedback visual
- QoL agarre
- Diferenciar objetos
- Componente trigger para ammo.js

TOFIX:
- hitbox de agarre
- objetos muy rapidos (arreglado)

## 23/03
Reunión con Juanmi y Toni, me pasará descripciones de las diferentes escenas a hacer

~~Arreglado~~ distancia agarre

**IMPORTANTE** dos hacd si colisionan se pegan entre si. Se puede mirar de usar ccd para colisiones criticas (parece que existe)
vhacd no es viable porque tarda mucho en generar el collider y despues no es preciso...

Se esta mirando de ajustar la distancia de agarre de los objetos, a lo mejor al tener la escala general de lo que se puede agarrar se puede 

## 25/03

Comprobar raycasts correctamente parece que si mano dentro no lo pilla???
Tiene sentido si comprueba colisión con malla, no volumen.

## 27/03

Los raycast no funcionan si la mano está dentro, rollback a sphere collider.

Se ha añadido reglas para el agente ya que para refactorizaciones simples la lia.

## 30/03
Ruidos obras por la tarde...
Visualizando los "colliders" de sphere-collider, descargado, se puede ver el problema,
pasar a colliders más precisos


## 15/04
se usa el componente por defecto de oob-collider
Hay incompatibilidades con el raycast de las manos

## 17/04
Se han arreglado incompatibilidades y solucionado un bug respecto al agarre.
Se tiene que mirar de usar otro sistema que no sea obb para figuras convexas 

## 20/04
Se ha añadido el teclado, aunque es molesto que tengas que escuchar desde document y no desde el componente,
lo que es funcionar funciona.

Habria que pensar en el online, si se va a incluir

## 24/04
Modificado teclado y fuente custom para poder imprimir los siguientes caracteres:
ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.?¿!¡/:;,*§£$ø@+°-~#&²'{}[]|`\()=%*µ àáâéèìíòóùúëêïîöôùüûÀÁÂÉÈËÊÏÎÌÍÖÔÒÓÜÛÙÚçÇ€ñÑ<>"

importante ampliar el tamaño del atlas en la pagina https://msdf-bmfont.donmccurdy.com/

_curioso que si pulsas ` o ´ aparece "Dead" dentro de la caja de texto..._

despues en a-frame-keyboard.min.js se modifica el mapa de carácteres y listo, teclado modificado (ajustando el fondo para acomodar las nuevas teclas)

Nótese que al quitar debug, se puede ver un margen entre los elementos fisicos, se puede ajutar con ammo-shape.margin (por defecto 0.01)

## 27/04
Base minima de comunicación de websockets

## 29/04
mock login (no hace nada, pero existe)

## 4/05 MTFBWY
pequeños avances en el online

## 6/05
A saber que me dará tiempo entregar para mañana...
Efecto glow con ayuda IA
Prueba de plataforma movil para una idea de minijuego, pero haciendo pruebas yo habia miniclips de los objetos encima
con la IA, llegado a una solución totalmente dinamica, aunque no me acaba de convencer. Investigar usar constraints
 
## 7/05
Con ayuda de IA, creado un componente para ayudar al desarrollo sin las gafas (que por lo que sea estan ocupadas estos dias)

## 8/05
Movido archivos
Añadido easter egg
Añadido musica
Hecho más evidente el efecto de glow, no se comporta muy bien con cuerpos curvos
Efecto de no gravedad, además se ha buscado de hacer destroy de objetos de Bullet

Resultados viernes CxT:
Las instrucciones no se transmiten dentro del juego de forma efectiva, tendré que hacer una escena tutorial...
La musica de fondo era muy alta en relación a otra musica
El easter egg era muy raro que la gente vaya, de forma provisional he puesto una luz que resalta el pilar un poco (aunque lo cambiaré en el futuro)
Los objetos son demasiado grandes y dificulta manejar 2 de forma simultanea, los he hecho algo más pequeños
Grab-fix no siempre funciona a la primera! tendre que investigar esto ya que costó arreglar el bug de agarre...
el efecto grab-glow lo he hecho más evidente
He ralentizado la plataforma

Aunque los chavales y chavalas se han divertido de forma general, no tener la guia didactica ni ningun minijuego hace que algunos se pierdan en no saber que hacer. Considero que a nivel de assets y comportamientos fisicos esta bien, se deberia priorizar crear las escenas solicitadas, junto con la del tutorial y los minijuegos, para tener un TFG de matricula
Tambien el control del tiempo ha fallado al principio y la variedad de tamaño de cabezas hace una pesadilla ajustar las gafas...

Acordarse de hacer alguna foto, siempre puedo preguntar al resto

El juego esta en el server del ltim en lyoko.ltim.uib.es con contraseña cambiada [REDACTED]

BUGFIX: en el server no se mostraba en el teclado ni ç ni ñ (aunque en la caja de texto sí), usando el codigo unicode directamente se ha arreglado


## 9/05
Otro dia de fira, mucho niño chico, aunque las gafas no les iban bien y tenia que explicar externamente los controles, fue un dia similar al viernes.
Parece que mover ciertos objetos y cambiar la velocidad de la plataforma fue un cambio a mejor.

## 11/05
Iniciado a diseñar la estructura del tutorial (ver imagen), aunque hará falta un sistema de cambio de escenas, a a-frame no le gusta tener
<a-scene> dentro de <a-scene> (ni al lado).

## 12/05
Inicio del sistema de escenas, antes de nada, con ayuda de la IA se indentifica los componentes en uso que deben implementar un play() pause() remove() acorde a su comportamiento
Despues, de las utilidades llamadas "superframe" https://github.com/supermedium/superframe se usará template para cargar/descargar escenas
La cosa ha ido bien, quedaria añadir una escena de menu, alguna forma de volver al menu desde la principal y el tutorial.
Al final basta implementar remove() ya que se es lo que se llamará al descargar

Tambien se ha refactorizado grab-fix para que sea más estable, aunque en el servidor la mesa tarda mucho en cargar


## 13/05
Recibido guia de escenas didacticas, habra que crear un triproyector de sombras
Trabajando en el menu principal, queda programar un boton
Se ha creado la funcion AFRAME.changeScene() por conveniencia

## 15/05
Añadida funcionalidad basica del componente 'button', puede cambiar de escena al hacer click

## 18/05
Añadida la funcionalidad de player-config, que aprovecha la dualidad de sistema-componente para, a traves de un componente, modificar su sistema y alterar las capacidades del jugador, como poder moverse o agarrar objetos. (esto principalmente para el tutorial o minijuegos que puedan surgir)

Tambien se ha modificado desktop-controller para poder hacer click a los botones y hecho el jugador algo más lento (evita mareos y screen tearings)

## 22/05
Creado modelo provisional del proyector de sombras, queda ajustar materiales

## 27/05
Habiendo acabado la entrega de Lab, ahora full TFG, yay...

Se ha mejorado el proyector, las sombras raras se han eliminado (shade flat) y se han añadido luces direccionales para las projecciones de sombras.
Se ha creado una escena nueva para probar de forma aislada estos cambios, aunque queda por hacer ajustes.


## 30/05
Se ha mejorado las luces del proyector, ahora usa luces "spot" focales.
Las luces ambientales de la escena interfieren en la fuerza de las sombras, investigar.

## 1/06
Mejora en el modelado del proyector
Se tiene que tener en cuenta la altura de la persona, si es muy alto no se alinea bien la altura para ver las 3 vistas

Añadir muros de respawn (death-barrier) en todas las escenas

## 2/06
Añadido el modelo de los diferentes botones del panel de control del proyector.
Aun estos no tienen funcionalidad, a falta de ver como queda en VR.

Los botones es mejor tenerlo separado del modelo principal para que sea más facil ajustar, colorear, e incluso animarlo, aunque desde el modelo se puede hacer (debería al menos) desde el inspector de aframe haria lo que con blender haría igualmente...

Nota, para usar {{ atributo }} en los templates hay que especificar "type: handlebars" en el componente
Nota2: usar templates impide usar aframe-watcher para guardar los cambios...

## 3/06
Para los botones fisicos, se ha cambiado de grab-glow (dentro de my-grab) a interact-glow (en su propio archivo).

Además, se ha arreglado un bug del doble click con el cursor, ya que ambas manos compartian los eventos click.
Queda, respecto a esta parte:
- añadir un suavizado si se pulsa el boton manualmente
- acabar el resto de la funcionalidad del projector
- si acaso fusionar ui/button y physic-button (a efectos practicos es casi lo mismo) (puede ser un whapper o algo)


## 05/06
Se ha refactorizado parte del codigo a base-button, del physic-button se tiene que mover más cosas, pero buneo, ya se hará.
Un error que crasheaba el motor se ha resuelto haciendo que el mixin static-base este en un hijo de #projector con el modelo 3D, así la generación dinamica de textos o cosas varias no molesta

Por otro lado, se ha probado la funcionalidad de iconos, estos deberian tener en cuenta el tamaño del objeto para posicionarse fuera, ademas de tener en cuenta sistema de coornedadas local.

## 7/6
Siguiendo con las refactorizaciones, se ha eliminado el codigo de imagen y texto para un physic-button, ya que, un boton de UI siempre es igual, pero un boton fisico puede tener una geometria variable (y el texto/icono te puede interesar tenerlo en otro lado...)

Mirar el bug ese del boton verde y un autoclick en modo escritorio y la no detección entre ciertos botones

Más iconos y funcionalidad de encender y apagar la luz

## 8/6
Los hex de los colores son: (mantener orden en donde aplique!)
- perfil #E7CF6FFF
- planta #5DE761FF
- alzada #E76B82FF

Seguramente puede haber error si se tiene en cuenta el alfa (FF)

Se han solucionado bugs y asperezas de los botones.

Se ha implementado el selector de sobras, las imagenes aparecen rotadas y estiradas, habrá que usar otro plano por encima...

Se ha implementado que el proyector lea las selecciones de los selectores, valga la redundancia.
Tambien se ha creado otro plano para el icono

Considerar pasar los iconos a svg (los definitivos)


## 9/6

Se ha modificado la geometria del tap para que esté alineada con los ejes, lo que dentro de blender he tenido que transladar la geometria (modo edición) porque despues el ammo-body se desplazaba respecto a la geometria (ni idea de por que, pero bueno)

## 10/06

Se ha acabado de implementar la funcionalidad basica de la plataforma (queda pulir sus posiciones y trayecto [capaz hacerlo por fases])

Tambien se ha modificado el PID para añadir friccion, retribución (rebote) y aceleracción maxima.

## 11/6

Se ha añadido la funcionalidad de rotar la platadorma

## 12/6

Se ha añadido la funcionalidad de recolocar la figura sobre la plataforma.
Se ha reutilizado el pid con modificaciones para añadir eventos de finalización y controlar la gravedad si se elimina el componente.

Para la plataforma, se usan promesas para controlar la secuencia del movimiento y colocación del objeto.

Mirar si hace falta salvaguardas si se coge el objeto o se "cae"

Una propuesta de lo que registrar seria
Accions a registrar:
Trivial (tecnicamente ya se hace o se puede hacer muy facil):

    Apunta a X objecte
    Agafa (amb ma o raig) X objecte
    Atreu X objecte
    Amolla X objece
    Pulsa X botó
    Encen/Apaga llum
    Selecciona X ombra per Y projecció
    Valida ombres (amb resultat)
    Canvi de escena

Facil:

    Rota X en tdelta en Y eix Z objecte
    Desplaça X tdelta en Y eix Z objecte
    Fa (o intenta) pasar X objecte per Y forat


Mitja:

    Entra/Surt en camp de visió X objecte
    Vista central entra/surt X objecte


## 13/06

Implementando el LOGGER, este genera un JSON al pulsar F9 (al menos mientras hago pruebas)

Se ha colocado las llamadas pertinentes en los diferentes scripts, a la espera de algunos TODOs que requieren las gaJuan Miguel Ribera Puchadesfas para comprobarlo...

nota: desacoplar base-button i physic-button

## 14/06

Se ha añadido más logs al LOGGER, además de avanzar en la memoria

Hay un bug donde girar la plataforma hace que la figura superior se desalinee, investigar

## 15/06

Arreglado bugs al loggear, nulls y duplicidades en el registro.

## 16/06

Implementado en el portatil (Ubuntu) un modelo agente local (Qwen3-Coder-Next-UD-Q2_K_XL), lento, y no el mejor del mundo, pero puede ser util para refactorizaciones sencillas (y muy guiadas), a nivel de proyecto. Capaz pruebo otros modelos a ver si alguno rinde mejor, pero tampoco le quiero dedicar tanto tiempo, es más tener un plan B cuando se acaban el plan gratuito de las principales IAs, si es que es necesario usarlo.

Por otro lado, se ha cambiado a usar constraints para la plataforma y el objeto que se encuentra sobre, además, ahora la plataforma y el proyector no colisionan entre sí, pero sí con el resto


## 17/06

Revisar bug colisión plataforma (solo windows/chrome??)

Implementado un modelo SQL y un pequeño backend para controlar las figuras y sombras.
Se tendria que dockerizar y implementar una persistencia de logs

## 18/6

Se ha dockerizado el mysql, se ha añadido 2 endpoint nuevos:
- uno para obtener las figuras por clase
- y otro para guardar en el server los logs (no funciona)

Arreglado un bug de codigo en deshuso que causaba una desconfiguración en las fisicas de la plataforma.

Tambien corregido errores de forma (forzar UTF-8 y tamaños VARCHAR)

## 19/06

Arreglado el bug que arreglé ayer para Windows, lo que tiene que ntfs no tenga permisos unix al pasar al docker y mysql ignore el archivo por ser demasiado permisivo...

player-config ahora está en conjunción con un sistema, se ha limpiado la forma de operar y obtener el elemento jugador.

Por alguna razón hacer lo mismo con scene-manager petaba aframe silenciosamente.

Dejado por hacer:
- Acabar de configurar las clases en base al backend.
- Realizar validación sombras.
- Pasar a siguiente clase
- Checkear logs JSON
- Mirar objetos en campo visión.
- Memoria....


## 20/06

Creado normas de agente (aunque no me haga especialente caso...)

Se realiza la validación de figuras (en base a la db, hay que cambiar los paràmetros)
Tambien se ha cambiado a un sistema scene-manager y se ha cimentado el cambio de clase.
Además, ahora el material cambia al rotar la figura (revisar el contraint si se deshace y no se vuelve a hacer hasta sacar y entrar la figura)

Dejado por hacer:
- Acabar de configurar las clases en base al backend. (comprobar)
- Realizar validación sombras. (ajustar valores)
- Pasar a siguiente clase (comprobar)
- Checkear logs JSON
- Mirar objetos en campo visión.
- Memoria.... (ayuda)


## 22/06

Arreglado bug filtro de agarre
Creado modelos de figuras para las diferentes clases.
