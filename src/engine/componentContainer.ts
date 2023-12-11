import { Component } from "./component/component";
import { Scene } from "./componentTimeline";

class ComponentContainer {
  private components: Component[];
  private enabledScenes: Scene[][];

  constructor() {
    this.components = [];
    this.enabledScenes = [];
  }

  addComponent(component: Component, enabledScenes: Scene[]) {
    this.components.push(component);
    this.enabledScenes.push(enabledScenes);
  }

  queryEnabledComponents(scenes: Scene[]) {
    return this.components.filter((_, index) => {
      if (this.enabledScenes[index].length < scenes.length) {
        return false;
      }

      for (const scene of scenes) {
        if (!this.enabledScenes[index].includes(scene)) {
          return false;
        }
      }

      return true;
    });
  }
}

export default ComponentContainer;
