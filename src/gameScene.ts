import { Engine } from "@babylonjs/core/Engines/engine"
import { Scene, ScenePerformancePriority } from "@babylonjs/core/scene"
import { Animation } from "@babylonjs/core/Animations/animation"
import { PostProcess } from "@babylonjs/core/PostProcesses/postProcess"
import { AnimationGroup } from "@babylonjs/core/Animations/animationGroup"
import { Effect } from "@babylonjs/core/Materials/effect"

export default class GameScene extends Scene {

    private fadeLevel?: any
    private postProcess?: PostProcess
    private animation?: Animation
    private ppAni?: AnimationGroup

    constructor(engine: Engine, view: HTMLCanvasElement) {
        super(engine)

        this.performancePriority = ScenePerformancePriority.Aggressive
        this.autoClear = true

        this.fadeLevel = {
            value: 0.0
        };

        Effect.ShadersStore["fadePixelShader"] =
            "precision highp float;" +
            "varying vec2 vUV;" +
            "uniform sampler2D textureSampler; " +
            "uniform float fadeLevel; " +
            "void main(void){" +
            "vec4 baseColor = texture2D(textureSampler, vUV) * fadeLevel;" +
            "baseColor.a = 1.0;" +
            "gl_FragColor = baseColor;" +
            "}";

        setTimeout(() => {
            this.postProcess = new PostProcess("Fade", "fade", ["fadeLevel"], null, 1.0, this.activeCamera);
            this.postProcess.onApply = (effect) => {
                effect.setFloat("fadeLevel", this.fadeLevel.value);
            };
            this.ppAni = new AnimationGroup('ppAni', this);
            this.ppAni.normalize(0, 100);

            this.animation = new Animation('fadeAnim', "value", 60, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CONSTANT)
            this.postProcess.animations.push(this.animation);
            this.fadeIn()
        }, 300)
    }
    fadeIn?(): void {
        this.fadeLevel = {
            value: .0
        };
        const fadeOutKeys = [
            { frame: 0, value: 0 },
            { frame: 100, value: 1 }
        ];

        this.animation.setKeys(fadeOutKeys);

        this.ppAni.addTargetedAnimation(this.animation, this.fadeLevel);
        this.ppAni.play();
    }
    fadeOut?(): AnimationGroup {
        this.fadeLevel = {
            value: 1.0
        };
        const fadeOutKeys = [
            { frame: 0, value: 1 },
            { frame: 100, value: 0 }
        ];

        this.animation.setKeys(fadeOutKeys);

        this.ppAni.addTargetedAnimation(this.animation, this.fadeLevel);
        this.ppAni.play();
        
        return this.ppAni
    }



}


