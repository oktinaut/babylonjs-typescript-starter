import { Engine } from "@babylonjs/core/Engines/engine";
import { Scene } from "@babylonjs/core/scene";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { AdvancedDynamicTexture } from "@babylonjs/gui/2D/advancedDynamicTexture";
import { Button } from "@babylonjs/gui/2D/controls/button";
import { Container } from "@babylonjs/gui/2D/controls/container";
import { sceneObservers } from "./observers";
import { Camera } from "@babylonjs/core";
import physicsWithHavok from "./physicsWithHavok";

const mainWindowGUI = require("./HUD.json")
const itemGUI = require("./Item.json")


export default class uiScene extends Scene {
  private advancedTexture?: AdvancedDynamicTexture;

  constructor(engine: Engine, view: HTMLCanvasElement) {
    super(engine);

    this.advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI("UI")
    //this.advancedTexture.idealWidth = 1920;

    // let missionComp = Container.Parse(mainWindowGUI, this.advancedTexture)
    let itemComp = Container.Parse(itemGUI, this.advancedTexture)

    // let missions = missionComp.getDescendants(false, control => control.name === 'Items')[0]

    this.advancedTexture.parseSerializedObject(mainWindowGUI)

    // this.advancedTexture.addControl(missionComp)

    //@ts-ignore
    //this.advancedTexture.addControl(itemComp)

    /*

    scroll.onPointerEnterObservable.add(function(){
        console.log("in");
        camera1.detachControl();
        bgcamera.detachControl();
    });

    scroll.onPointerOutObservable.add(function(){
        console.log("out");        
        camera1.attachControl(canvas, true);
        bgcamera.attachControl(canvas, true);
    });
    */



    let loadPhysxBtn = Button.CreateSimpleButton("closeConvoBtn", "Load Havok");
    loadPhysxBtn.width = "280px";
    loadPhysxBtn.height = "60px";
    loadPhysxBtn.background = "#fff9f9";
    loadPhysxBtn.verticalAlignment = 0;
    loadPhysxBtn.onPointerClickObservable.add(() => {

      LoadNextScene()

    });

    this.advancedTexture.addControl(loadPhysxBtn);
    const camera = new Camera("camera", Vector3.Zero(), this);
    camera.attachControl(view);

    async function LoadNextScene() {
      let createSceneModule = physicsWithHavok// await getSceneModuleWithName('scene1');
      // Execute the pretasks, if defined
      await Promise.all(createSceneModule.preTasks || []);

      let nextScene = await createSceneModule.createScene(engine, view);

      let scenes = {
        "currentScene": this,
        "nextScene": nextScene

      }

      sceneObservers.changeScene.notifyObserversWithPromise(nextScene);
    }
  }

}
