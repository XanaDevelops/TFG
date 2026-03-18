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