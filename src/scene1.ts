import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera"
import { Engine } from "@babylonjs/core/Engines/engine"
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { Vector3 } from "@babylonjs/core/Maths/math.vector"
import { SampleMaterial } from "./Materials/SampleMaterial"
import { Scene } from "@babylonjs/core/scene"
import { CreateSceneClass } from "./createScene"


class Scene1 implements CreateSceneClass {
    preTasks = [];

    createScene = async (engine: Engine, view: HTMLCanvasElement): Promise<Scene> => {
        
        const scene = new Scene(engine);

        const camera = new ArcRotateCamera(
            "camera",
            Math.PI / 2,
            Math.PI / 3.2,
            2,
            Vector3.Zero(),
            scene)

        camera.attachControl(view)

        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene)

        const mesh = MeshBuilder.CreateGround("mesh", {}, scene)
        const material = new SampleMaterial("material", scene)
        mesh.material = material

        return scene

    }
}
export default new Scene1();


