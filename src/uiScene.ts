import { Engine } from "@babylonjs/core/Engines/engine"
import { Scene } from "@babylonjs/core/scene"
import { Vector3 } from "@babylonjs/core/Maths/math.vector"
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture"
import { Button } from "@babylonjs/gui/2D/controls/button"
import scene2 from "./scene2"
import { sceneObservers } from "./observers"
import { Camera } from "@babylonjs/core"

export default class uiScene extends Scene {
    private advancedTexture?: AdvancedDynamicTexture

    constructor(engine : Engine, view : HTMLCanvasElement) {
        super(engine)

        this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI")
        this.advancedTexture.idealWidth = 1920

        let closeButton = Button.CreateSimpleButton('closeConvoBtn', 'ChangeScene')
        closeButton.width = '280px'
        closeButton.height = '60px'
        closeButton.background = '#fff9f9'
        closeButton.verticalAlignment = 0
        closeButton.onPointerClickObservable.add(() => {
         alert('clicked')
         sceneObservers.changeScene.notifyObservers(new scene2(engine,view))
        })

        this.advancedTexture.addControl(closeButton)
        const camera = new Camera('camera',Vector3.Zero(),this)
        camera.attachControl(view)
    }
}


