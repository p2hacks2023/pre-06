import ComponentContainer from "./componentContainer";
import Icecup from "./component/icecup";
import ScratchableImage from "./component/scratchableImage";
import Shatter from "./component/shatter";
import VideoPreview from "./component/videoPreview";
import Bound from "./geometry/bound";
import GameRouter from "./executor";
import { CropImageFromVideo } from "./video/crop";
import Button from "./component/button";
import { Grade, GradeList } from "./model/grade";
import Caption from "./component/caption";
import HotMeter from "./component/hotmeter";
import HeavenBackgroundImage from "./component/heavenBackgroundImage";

// scratch!シーンを終える条件となる、残りアツピクセル比率のしきい値
const SCRATCH_FINISH_HOTPROP_THRESHOLD = 0.15;
// かき氷が下から上に向かってくるときの、かき氷の見える部分の(かき氷の大きさに対する)最大割合
const ICECUP_RAISING_RATIO = 0.5;
// 撮影時のアツいエフェクトの表示条件となるアツさのしきい値
const HOT_EFFECT_THRESHOLD = 30.0;

export function InitializeComponents(
  router: GameRouter,
  canvas: HTMLCanvasElement,
  videoElement: HTMLVideoElement,
) {
  // -- Game Components -- //

  let componentContainer: ComponentContainer = new ComponentContainer();

  // グローバルな状態として、画像全体のアツさを保持する
  let stateHotnessScore = 0;
  let stateHotnessScoreChangedFunc: (hotness: number) => void;
  let stateGrade: Grade = new GradeList().getGrade(0);
  let stateGradeDeterminedFunc: (grade: Grade) => void;
  let stateHotPropChangedFunc: (hotProp: number) => void;

  const heavenBackgroundImage = new HeavenBackgroundImage(
    new Bound(0, 0, canvas.width, canvas.height),
  );
  componentContainer.addComponent(heavenBackgroundImage, [
    "finish",
    "satisfied",
    "syruptime",
    "result",
  ]);

  const scratchableImage = new ScratchableImage(
    new Bound(0, 0, canvas.width, canvas.height),
    () => {
      router.stageScene("scratch!");
    },
    (hotProp, hotness) => {
      if (hotProp < SCRATCH_FINISH_HOTPROP_THRESHOLD) {
        router.stageScene("finish");
        stateHotnessScore = hotness;
        stateHotnessScoreChangedFunc(hotness);
      }
      stateHotPropChangedFunc(hotProp);
    },
  );
  componentContainer.addComponent(scratchableImage, [
    "flush",
    "scratch!",
    "finish",
  ]);

  componentContainer.addComponent(
    new VideoPreview(
      new Bound(0, 0, canvas.width, canvas.height),
      videoElement,
      (hotness) => {
        stateHotnessScore = hotness;
        stateHotnessScoreChangedFunc(hotness);
      },
      HOT_EFFECT_THRESHOLD,
    ),
    ["take!"],
  );

  const shatterDiameter = Math.min(canvas.width, canvas.height) / 6;
  const shatterDiameterMargin = shatterDiameter * 0.2;
  componentContainer.addComponent(
    new Shatter(
      new Bound(
        canvas.width / 2 - shatterDiameter / 2,
        canvas.height - shatterDiameter - shatterDiameterMargin,
        shatterDiameter,
        shatterDiameter,
      ),
      videoElement,
      (videoElement) => {
        scratchableImage.setImageData(
          CropImageFromVideo(videoElement, canvas.width, canvas.height),
        );
        router.stageScene("flush");
      },
    ),
    ["take!"],
  );

  const icecupWidth = Math.min(canvas.width, canvas.height) * 1.25;
  const finishWidth = Math.min(canvas.width, canvas.height) * 0.75;
  const icecup = new Icecup(
    new Bound(
      canvas.width / 2 - icecupWidth / 2,
      canvas.height,
      icecupWidth,
      icecupWidth,
    ),
    new Bound(
      Math.max(canvas.width / 2 - finishWidth / 2, 0),
      Math.max(canvas.height / 2 - finishWidth / 2, 0),
      finishWidth,
      finishWidth,
    ),
    () => {
      stateGrade = new GradeList().getGrade(stateHotnessScore);
      stateGradeDeterminedFunc(stateGrade);
      router.stageScene("satisfied");
    },
    () => {
      router.stageScene("result");
    },
  );
  componentContainer.addComponent(icecup, [
    "scratch!",
    "finish",
    "satisfied",
    "syruptime",
    "result",
  ]);

  const hotMeterHeight = canvas.height * 0.4;
  const hotMeter = new HotMeter(
    0,
    (canvas.height - hotMeterHeight) * 0.5,
    hotMeterHeight,
    0.0,
    HOT_EFFECT_THRESHOLD,
  );
  componentContainer.addComponent(hotMeter, ["take!"]);

  // -- Buttons -- //

  const buttonResultFontSize = Math.min(canvas.width, canvas.height) * 0.05;
  const buttonResultRound = buttonResultFontSize * 0.2;

  const satisfiedButtonWidth = Math.min(canvas.width, canvas.height) * 0.4;
  const satisfiedButton = new Button(
    new Bound(
      canvas.width / 2 - satisfiedButtonWidth / 2,
      canvas.height - satisfiedButtonWidth,
      satisfiedButtonWidth,
      satisfiedButtonWidth * 0.4,
    ),
    buttonResultRound,
    "結果を見る",
    buttonResultFontSize,
    ["Mochiy Pop One", "sans-serif"],
    "#3388dd",
    () => {
      router.stageScene("syruptime");
    },
  );
  componentContainer.addComponent(satisfiedButton, ["satisfied"]);

  const resultButtonWidth = Math.min(canvas.width, canvas.height) * 0.4;
  const resultButton = new Button(
    new Bound(
      canvas.width / 2 - resultButtonWidth / 2,
      canvas.height - resultButtonWidth,
      resultButtonWidth,
      resultButtonWidth * 0.4,
    ),
    buttonResultRound,
    "もう一度遊ぶ",
    buttonResultFontSize,
    ["Mochiy Pop One", "sans-serif"],
    "#33bb88",
    () => {
      router.stageScene("take!");
    },
  );
  componentContainer.addComponent(resultButton, ["result"]);

  // -- Captions -- //

  const hotCaptionFontSize = Math.min(canvas.width, canvas.height) * 0.1;
  const hotCaptionStrokeWidth = Math.min(canvas.width, canvas.height) * 0.02;

  const captionUpTake = new Caption(
    new Bound(0.0, 0.0, canvas.width, 0.0),
    new Bound(0.0, 0.0, canvas.width, canvas.height * 0.1),
    0.1,
    "熱いモノは何処だ!?",
    hotCaptionFontSize,
    hotCaptionStrokeWidth,
    true,
    ["Yuji Syuku", "sans-serif"],
    [0.7, 0.0, 0.0],
    [1.0, 1.0, 1.0],
    "normal",
  );
  componentContainer.addComponent(captionUpTake, ["take!"]);

  const captionUpScratch = new Caption(
    new Bound(0.0, 0.0, canvas.width, 0.0),
    new Bound(0.0, 0.0, canvas.width, canvas.height * 0.1),
    0.1,
    "削れ!!!",
    hotCaptionFontSize,
    hotCaptionStrokeWidth,
    true,
    ["Yuji Syuku", "sans-serif"],
    [0.7, 0.0, 0.0],
    [1.0, 1.0, 1.0],
    "normal",
  );
  componentContainer.addComponent(captionUpScratch, ["scratch!"]);

  const captionMiddleTake = new Caption(
    new Bound(
      0.0,
      canvas.height -
        shatterDiameter -
        hotCaptionFontSize -
        shatterDiameterMargin * 2,
      canvas.width,
      hotCaptionFontSize,
    ),
    null,
    0.0,
    "うおおお!!!熱いぞ!!!",
    hotCaptionFontSize,
    hotCaptionStrokeWidth,
    false,
    ["Yuji Syuku", "sans-serif"],
    [1.0, 0.0, 0.0],
    [0.3, 0.0, 0.0],
    "toohot",
  );
  componentContainer.addComponent(captionMiddleTake, ["take!"]);

  const coolCaptionFontSize = Math.min(canvas.width, canvas.height) * 0.08;
  const coolCaptionStrokeWidth = Math.min(canvas.width, canvas.height) * 0.01;

  const captionUpCool = new Caption(
    new Bound(0.0, canvas.height * 0.1, canvas.width, hotCaptionFontSize),
    null,
    0.008,
    `かくして世界は\n\nひんやりを取り戻した`,
    coolCaptionFontSize,
    coolCaptionStrokeWidth,
    true,
    ["Yuji Syuku", "sans-serif"],
    [0.4, 0.6, 1.0],
    [1.0, 1.0, 0.3],
    "heaven",
  );
  componentContainer.addComponent(captionUpCool, ["satisfied"]);

  const resultSmallCaptionFontSize =
    Math.min(canvas.width, canvas.height) * 0.06;
  const resultSmallCaptionStrokeWidth =
    Math.min(canvas.width, canvas.height) * 0.006;
  const resultLargeCaptionFontSize =
    Math.min(canvas.width, canvas.height) * 0.15;
  const resultLargeCaptionStrokeWidth =
    Math.min(canvas.width, canvas.height) * 0.02;
  const resultCaptionMargin = Math.min(canvas.width, canvas.height) * 0.04;

  const captionKekkaResult = new Caption(
    new Bound(
      0.0,
      canvas.height * 0.1,
      canvas.width,
      resultSmallCaptionFontSize,
    ),
    null,
    0.0,
    "結果",
    resultSmallCaptionFontSize,
    resultSmallCaptionStrokeWidth,
    true,
    ["Yuji Syuku", "sans-serif"],
    [0.4, 0.6, 1.0],
    [1.0, 1.0, 0.3],
    "normal",
  );
  componentContainer.addComponent(captionKekkaResult, ["result"]);
  const captionGradeResult = new Caption(
    new Bound(
      0.0,
      canvas.height * 0.1 + resultSmallCaptionFontSize + resultCaptionMargin,
      canvas.width,
      resultLargeCaptionFontSize,
    ),
    null,
    0.0,
    stateGrade.name,
    resultLargeCaptionFontSize,
    resultLargeCaptionStrokeWidth,
    true,
    ["Yuji Syuku", "sans-serif"],
    [0.4, 0.6, 1.0],
    [1.0, 1.0, 0.3],
    "normal",
  );
  componentContainer.addComponent(captionGradeResult, ["result"]);

  const captionScoreResult = new Caption(
    new Bound(
      0.0,
      canvas.height * 0.1 +
        resultSmallCaptionFontSize +
        resultLargeCaptionFontSize +
        resultCaptionMargin * 2,
      canvas.width,
      resultSmallCaptionFontSize,
    ),
    null,
    0.0,
    "",
    resultSmallCaptionFontSize,
    resultSmallCaptionStrokeWidth,
    true,
    ["Yuji Syuku", "sans-serif"],
    [0.4, 0.6, 1.0],
    [1.0, 1.0, 0.3],
    "normal",
  );
  componentContainer.addComponent(captionScoreResult, ["result"]);

  stateHotPropChangedFunc = (hotProp) => {
    icecup.bound.y =
      canvas.height - icecupWidth * (1.0 - hotProp) * ICECUP_RAISING_RATIO;
  };

  stateGradeDeterminedFunc = (grade) => {
    icecup.setGrade(stateGrade);
    captionGradeResult.changeText(grade.name);
    captionScoreResult.changeText(`スコア: ${stateHotnessScore.toFixed(2)}`);
  };

  stateHotnessScoreChangedFunc = (hotness) => {
    captionMiddleTake.changeVisible(hotness > HOT_EFFECT_THRESHOLD);
    hotMeter.updatePercentage(hotness);
  };

  return componentContainer;
}
