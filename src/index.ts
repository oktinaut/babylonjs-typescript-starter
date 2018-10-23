import * as BABYLON from "babylonjs";

import { SampleMaterial } from "./Materials/SampleMaterial";

const view = document.getElementById("view") as HTMLCanvasElement;
const engine = new BABYLON.Engine(view, true);

const scene = new BABYLON.Scene(engine);

const camera = new BABYLON.ArcRotateCamera(
    "camera",
    Math.PI / 2,
    Math.PI / 3.2,
    2,
    BABYLON.Vector3.Zero(),
    scene);

camera.attachControl(view);

const light = new BABYLON.HemisphericLight(
    "light",
    new BABYLON.Vector3(0, 1, 0),
    scene);

const mesh = BABYLON.MeshBuilder.CreateGround("mesh", {}, scene);

const material =  new SampleMaterial("material", scene);
mesh.material = material;

engine.runRenderLoop(() => {
    scene.render();
});
