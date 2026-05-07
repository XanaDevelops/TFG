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
