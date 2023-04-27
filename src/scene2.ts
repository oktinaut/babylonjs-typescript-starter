import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Engine } from "@babylonjs/core/Engines/engine";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Animation } from "@babylonjs/core/Animations/animation"

import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";

import GameScene from "./gameScene";
import { BounceEase, CubicEase, SineEase } from "@babylonjs/core";

export default class Scene2 extends GameScene {
  constructor(engine: Engine, view: HTMLCanvasElement) {
    super(engine,view);

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

    let anim = Animation.CreateAndStartAnimation('BallBounce', sphere, "position.y", 60, 100, 0.5, 2, Animation.ANIMATIONLOOPMODE_CYCLE,new SineEase());

    const mesh = MeshBuilder.CreateGround("mesh", {}, this);
    

  }
}
