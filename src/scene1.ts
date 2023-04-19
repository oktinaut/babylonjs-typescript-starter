import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera"
import { Engine } from "@babylonjs/core/Engines/engine"
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder"
import { Scene } from "@babylonjs/core/scene"
import { Vector3 } from "@babylonjs/core/Maths/math.vector"
import { SampleMaterial } from "./Materials/SampleMaterial"

import scene2 from "./scene2"
import { sceneObservers } from "./observers"

export default class scene1 extends Scene {

    constructor(engine: Engine, view: HTMLCanvasElement) {
        super(engine)
        const camera = new ArcRotateCamera(
            "camera",
            Math.PI / 2,
            Math.PI / 3.2,
            2,
            Vector3.Zero(),
            this)

        camera.attachControl(view)

        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            this)

        const mesh = MeshBuilder.CreateGround("mesh", {}, this)
        const material = new SampleMaterial("material", this)
        mesh.material = material
    }
}


