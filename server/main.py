import asyncio, json
import enum
from websockets.asyncio.server import serve


IP = "localhost"
PORT = 5050

# registro de conexiones por sala
# sala 0 sin unirse a sala
conections : dict[int, list[serve]] = {0 : []}

class EventType(enum.StrEnum):
    Login = "login"
    Join = "join"
    Move = "move"


    Echo = "echo"

async def login() -> bool:
    return True

async def join(roomID: int, websocket) -> bool:
    print("uniendo", roomID)
    ## TODO: hacerlo bien :)
    conections.get(roomID).append(websocket)

    return True

async def move(websocket, objID, pos: dict) -> bool:

    return True
async def handler(websocket):
    message = await websocket.recv()
    event = json.loads(message)
    print(event)
    assert event["type"] == EventType.Login

    ok = await login()
    if not ok:
        print("fail log in")
        return
    print("logueado", event["username"])

    await handler_loged(websocket)


async def handler_loged(websocket):
    async for message in websocket:
        event = json.loads(message)
        match event["type"]:
            case EventType.Join:
                await join(int(event["roomID"]), websocket)


            case EventType.Move:
                pass

            case EventType.Echo:
                await echo(websocket, event["message"])
            case _:
                print("LOL?")

    

async def echo(websocket, text: str):
    print("Echo", text)
    await websocket.send(json.dumps({"type": EventType.Echo, "message": text}))


async def main():
    async with serve(handler, IP, PORT) as server:
        try:
            await server.serve_forever()
        except KeyboardInterrupt, asyncio.exceptions.CancelledError:
            print("dew")
            return

if __name__ == "__main__":
    asyncio.run(main())