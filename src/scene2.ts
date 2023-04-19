import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { SampleMaterial } from "./Materials/SampleMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { float } from "@babylonjs/core";

export default class scene2 extends Scene {
  constructor(engine: Engine, view: HTMLCanvasElement) {
    super(engine);

    const camera = new ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 3.2,
      2,
      Vector3.Zero(),
      this
    );

    camera.attachControl(view);

    const light = new HemisphericLight("light", new Vector3(0, 1, 0), this);

    // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
    const sphere = MeshBuilder.CreateSphere(
      "sphere1",
      {
        diameter: 1,
      },
      this
    );
    // Move the sphere upward 1/2 its height
    sphere.position.y = 0.5;
    //const material = new SampleMaterial("material", this)
    //sphere.material = material

    const mesh = MeshBuilder.CreateGround("mesh", {}, this);

    // Code to fade to black and back.
    const startingIntensity: number = light.intensity;
    let frame: number = 0;
    const startingColor: Color4 = this.clearColor.clone();
    let t: float;
    this.onBeforeRenderObservable.add(() => {
      frame += 1;
      t = 0.5 + Math.cos(frame / 50) / 2
      light.intensity = startingIntensity * t;
      Color4.LerpToRef(
        new Color4(0, 0, 0, 1),
        startingColor,
        t,
        this.clearColor
      );
    });
  }
}
