/**
 * Create by hardy on 16/12/21
 * 主游戏场景
 */
class GameScene extends GameUtil.BassPanel {

    private intervalarr: number[];
    private touchlayer: egret.Shape;
    private beginpointx: number;
    private beginpointy: number;

    private hightscore: number;
    private curscore: number;
    private lvimg: MyBitmap;

    public constructor() {
        super();
    }
    public init() {
        BGMPlayer._i().play(SoundName.gamebgm);
        this.initdata();
        this.showbg();
    }
    private initdata() {
        GameData._i().GamePause = false;
        this.touchcount = 0;
        this.isfalldown = false;
        this.curpassline = 1;
        this.fallpositionY = this.mStageH - 350;
    }
    /**
     * 显示背景
     */

    private offpoinsion: number;
    private gamecontaint: egret.DisplayObjectContainer;
    private obscontaint: egret.DisplayObjectContainer;
    private jumpball: egret.Sprite;
    private fallpositionY: number;
    private touchcount: number;
    private isfalldown: boolean;
    private curpassline: number;
    private passlineText: GameUtil.MyTextField;

    private showbg() {

        //console.log('this.mStageW====', this.mStageW, '\nthis.mStageH=====', this.mStageH);

        this.intervalarr = [];

        var gamebg: egret.Shape = GameUtil.createRect(0, 0, this.mStageW, this.mStageH, 1, 0xde9f7c);
        this.addChild(gamebg);

        this.gamecontaint = new egret.DisplayObjectContainer();
        this.addChild(this.gamecontaint);
        this.obscontaint = new egret.DisplayObjectContainer();
        this.gamecontaint.addChild(this.obscontaint);

        this.offpoinsion = (this.mStageW - GameConfig.DesignWidth) / 2;

        let linenum: number = 100;
        for (var i: number = 0; i < linenum; i++) {
            var line: egret.Shape = GameUtil.createRect(0, this.mStageH - 310 - i * GameConfig.DICBH, this.mStageW, 10, 1, 0xffffff);
            this.gamecontaint.addChild(line);
            var passlinetext = new GameUtil.MyTextField(this.offpoinsion + 10, this.mStageH - GameConfig.DICBH - 270 - i * GameConfig.DICBH, 50, 0);
            passlinetext.setText((i + 1) + '');
            this.gamecontaint.addChild(passlinetext);

            var obsx = RandomUtils.limit(this.offpoinsion + 40, this.offpoinsion + GameConfig.DesignWidth - 40);
            var dis = RandomUtils.limitInteger(1, 100);
            if (dis >= 10 && i > 0) {
                var obs: egret.Shape = GameUtil.createRect(obsx, this.mStageH - GameConfig.DICBH - 190 - i * GameConfig.DICBH, 80, 80);
                obs.$setAnchorOffsetX(40);
                this.obscontaint.addChild(obs);
            }

        }
        
        var shap: egret.Shape = GameUtil.createRect(0, 0, this.offpoinsion, this.mStageH, 1, 0x000000);
        this.addChild(shap);
        var shap: egret.Shape = GameUtil.createRect(this.mStageW, 0, this.offpoinsion, this.mStageH, 1, 0x000000);
        shap.$setAnchorOffsetX(shap.width);
        this.addChild(shap);

        //画跳球
        this.darwjumpball();

        this.touchEnabled = true;
        this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.touchtap, this);

        this.passlineText = new GameUtil.MyTextField(this.mStageW / 2, 50, 100);
        this.passlineText.setText('0');
        this.passlineText.textColor = 0xff0000;
        this.addChild(this.passlineText);

        this.gameinterval();
    }
    private darwjumpball() {
        this.jumpball = new egret.Sprite();
        this.jumpball.graphics.beginFill(0x000000, 1);
        this.jumpball.graphics.drawCircle(0, 0, 40);
        this.jumpball.graphics.endFill();
        this.jumpball.graphics.beginFill(0xffffff, 1);
        this.jumpball.graphics.drawCircle(10, 7, 10);
        this.jumpball.graphics.endFill();
        this.jumpball.graphics.beginFill(0xffffff, 1);
        this.jumpball.graphics.drawCircle(30, 9, 9);
        this.jumpball.graphics.endFill();
        this.jumpball.graphics.beginFill(0x000000, 1);
        this.jumpball.graphics.drawCircle(10, 7, 4);
        this.jumpball.graphics.endFill();
        this.jumpball.graphics.beginFill(0x000000, 1);
        this.jumpball.graphics.drawCircle(30, 9, 4);
        this.jumpball.graphics.endFill();
        this.jumpball.x = this.offpoinsion + 100;
        this.jumpball.y = this.fallpositionY;
        this.gamecontaint.addChild(this.jumpball);
    }
    /**游戏定时器 */
    private gameinterval() {
        GameUtil.trace('interval');
        let dir = 1;
        let obsdir: number[] = [];
        for (var i: number = 0; i < this.obscontaint.numChildren; i++) {
            obsdir[i] = 1;
        }
        var intv = egret.setInterval(() => {
            this.jumpball.x += (20 * dir);
            if (this.jumpball.x >= this.offpoinsion + GameConfig.DesignWidth - 40) {
                dir = -1;
            }
            if (this.jumpball.x <= this.offpoinsion + 40) {
                dir = 1;
            }
            this.jumpball.$setScaleX(dir);

            for (var i: number = 0; i < this.obscontaint.numChildren-1; i++) {
                var obs = this.obscontaint.getChildAt(i);
                obs.x += ((10 + i) * obsdir[i]);
                
                if (obs.x >= this.offpoinsion + GameConfig.DesignWidth - 40) {
                    obsdir[i] = -1;
                }
                if (obs.x <= this.offpoinsion + 40) {
                    obsdir[i] = 1;
                }

                var rectball = GameUtil.getrect(this.jumpball,0,0);
                var rectobs = GameUtil.getrect(obs,0,40);
                if (rectball.intersects(rectobs)) {
                    this.gameover();
                    break;
                }
            }

        }, this, 50);
        this.intervalarr.push(intv);
        //this.gameover();
    }

    private checkgameover() {

        var bgameover = false;

        if (bgameover) {
            this.gameover();
        }
    }

    private touchbegin(evt: egret.TouchEvent) {

        if (GameData._i().GamePause) {
            return;
        }
        GameData._i().GamePause = true;
    }

    private touchtap(e: egret.TouchEvent) {
        //console.log('touchtap=====');
        if (GameData._i().GamePause) {
            return;
        }
        if (this.touchcount == 2) {
            return;
        }
        if (this.touchcount != 0 && !this.isfalldown) {
            return;
        }
        egret.Tween.removeTweens(this.jumpball);
        //console.log('jumpbally====', this.jumpball.y);
        var toy = this.jumpball.y - (GameConfig.DICBH * 0.6);
        //console.log('toy====', toy);
        egret.Tween.get(this.jumpball).to({ y: toy }, 200).call(this.falldown, this);
        this.touchcount++;

    }
    private falldown() {
        this.isfalldown = true;

        if (this.jumpball.y < this.mStageH - 350 - this.curpassline * GameConfig.DICBH) {
            this.fallpositionY = this.mStageH - 350 - this.curpassline * GameConfig.DICBH;
            this.curpassline++;
            var gctoy = this.gamecontaint.y + 200;
            egret.Tween.get(this.gamecontaint).to({ y: gctoy }, 300);
            this.passlineText.setText((this.curpassline - 1) + '');
            //console.log('passline====', this.curpassline);
        }
        var toy = this.fallpositionY;
        egret.Tween.get(this.jumpball).to({ y: toy }, 400).call(() => {
            if (this.touchcount == 2) {
                this.touchcount = 0;
                this.isfalldown = false;
            }
        }, this);
    }

    /**游戏结束 */
    public gameover() {
        GameUtil.trace('gameover');
        GameData._i().GamePause = true;
        //this.gametime.stop();
        egret.Tween.removeAllTweens();
        this.clearinter();

        egret.Tween.get(this.jumpball).to({ alpha: 0 }, 500).call(this.showgameover, this);

    }
    private showgameover() {
        var gameoverscene: egret.DisplayObjectContainer = new egret.DisplayObjectContainer();
        this.addChild(gameoverscene);

        var shap: egret.Shape = GameUtil.createRect(this.offpoinsion, 0, GameConfig.DesignWidth, this.mStageH, 1, 0xde9f7c);
        gameoverscene.addChild(shap);

        var posx = this.mStageW / 2;
        var posy = 200;
        var gametitletext = new GameUtil.MyTextField(posx, posy, 100, 0.5, 0.5);
        gametitletext.setText('欢乐跳跳跳');
        gametitletext.italic = true;
        gametitletext.textColor = 0x75bfea;
        gameoverscene.addChild(gametitletext);

        var passlinetext = new GameUtil.MyTextField(posx, posy+100, 100, 0.5, 0.5);
        passlinetext.setText(''+(this.curpassline-1));
        gameoverscene.addChild(passlinetext);

        var btnname = '';
        var fun = () => {
            this.removeChild(gameoverscene);
            this.restart();
        };
        var btn = new GameUtil.Menu(this, btnname, btnname, fun, [0]);
        btn.setScaleMode();
        btn.addButtonShap(GameUtil.createRect(0, 0, 300, 60, 1, 0x3399fe, 40, 50), -150, -30);
        btn.addButtonText('重新开始', 30);
        gameoverscene.addChild(btn);
        btn.x = posx;
        btn.y = this.mStageH/2;

    }
    /**
     *下一关
     */
    private nextlevelgame() {

    }

    /**重置游戏数据 */
    public reset() {
        this.gameinterval();
        this.restart();
    }
    /**清除定时器 */
    private clearinter() {
        GameUtil.clearinterval(this.intervalarr);
    }

    private exitgame() {
        GameUtil.GameScene.runscene(new StartGameScene());
    }

    private restartask() {
        var askcon: egret.DisplayObjectContainer = new egret.DisplayObjectContainer();
        this.addChild(askcon);
        askcon.touchEnabled = true;
        var shap: egret.Shape = GameUtil.createRect(0, 0, this.mStageW, this.mStageH, 0.6);
        askcon.addChild(shap);

        var bgname: string = 'restartbg_png';
        var gameoverbg: MyBitmap = new MyBitmap(RES.getRes(bgname), this.mStageW / 2, this.mStageH / 2);
        askcon.addChild(gameoverbg);
        var bgtext: MyBitmap = new MyBitmap(RES.getRes('restarttext_png'), 330, 80, gameoverbg);
        askcon.addChild(bgtext);

        var btname: string[] = ['yesbtn_png', 'nobtn_png'];
        var btnfun: Function[] = [this.restart,];
        for (var i: number = 0; i < 2; i++) {
            var btn: GameUtil.Menu = new GameUtil.Menu(this, btname[i], btname[i], (id) => {
                askcon.parent.removeChild(askcon);
                if (id == 0) {
                    this.restart();
                }
            }, [i]);
            askcon.addChild(btn);
            GameUtil.relativepos(btn, gameoverbg, 175 + 290 * i, 260);
        }
    }
    public restart() {
        this.initdata();
        this.passlineText.setText('0');
        this.jumpball.alpha = 1;
        this.jumpball.x = this.offpoinsion + 100;
        this.jumpball.y = this.fallpositionY;
        this.gameinterval();
        //this.restart();
    }
}