import * as BABYLON from "babylonjs";

import * as sampleVertexShader from "./glsl/sample.vertex.glsl";
import * as sampleFragmentShader from "./glsl/sample.fragment.glsl";

BABYLON.Effect.ShadersStore["sampleVertexShader"] = sampleVertexShader;
BABYLON.Effect.ShadersStore["sampleFragmentShader"] = sampleFragmentShader;

export class SampleMaterial extends BABYLON.ShaderMaterial {

    constructor(name: string, scene: BABYLON.Scene) {
        super(name, scene, { vertex: "sample", fragment: "sample" }, {
            uniforms: [
                "worldViewProjection",
                "time"
            ],
            attributes: [
                "position",
                "normal",
                "uv"
            ],
        });

        const startTime = Date.now();

        scene.registerBeforeRender(() => {
            const currentTime = Date.now();
            const time = currentTime - startTime;

            this.time = time / 1000;
        });
    }

    set time(value: number) {
        this.setFloat("time", value);
    }

}
