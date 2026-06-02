// 签文数据
const fortuneSticks = [
    // 上上签 (2签)
    {
        id: 1,
        name: '上上签',
        luckyPhrase: '龙腾四海',
        interpretation: '龙游四海，大展宏图。今年事业将如蛟龙出海，势不可挡，财运亨通，贵人相助。',
        level: 'supreme'
    },
    {
        id: 2,
        name: '上上签',
        luckyPhrase: '紫气东来',
        interpretation: '紫气临门，祥瑞满堂。福运将至，万事如意，家宅兴旺，平安顺遂。',
        level: 'supreme'
    },
    // 上签 (4签)
    {
        id: 3,
        name: '上签',
        luckyPhrase: '春风得意',
        interpretation: '春风送暖，喜事连连。事业有成，心情舒畅，桃花运旺，心想事成。',
        level: 'excellent'
    },
    {
        id: 4,
        name: '上签',
        luckyPhrase: '马到成功',
        interpretation: '策马奔腾，无往不利。做事一帆风顺，目标必达，前程似锦。',
        level: 'excellent'
    },
    {
        id: 5,
        name: '上签',
        luckyPhrase: '吉星高照',
        interpretation: '吉星庇佑，好运常伴。贵人相助，逢凶化吉，财运亨通。',
        level: 'excellent'
    },
    {
        id: 6,
        name: '上签',
        luckyPhrase: '福禄双至',
        interpretation: '福运与禄位双双降临，事业家庭两得意，财源广进，幸福美满。',
        level: 'excellent'
    },
    // 中上签 (4签)
    {
        id: 7,
        name: '中上签',
        luckyPhrase: '稳中求进',
        interpretation: '稳扎稳打，步步为营。虽无大起大落，但稳步上升，厚积薄发。',
        level: 'good'
    },
    {
        id: 8,
        name: '中上签',
        luckyPhrase: '守得云开',
        interpretation: '风雨过后见彩虹，困境终将过去，坚持就是胜利，光明就在前方。',
        level: 'good'
    },
    {
        id: 9,
        name: '中上签',
        luckyPhrase: '贵人指路',
        interpretation: '迷茫时遇贵人指点迷津，拨云见日，找到正确方向，事半功倍。',
        level: 'good'
    },
    {
        id: 10,
        name: '中上签',
        luckyPhrase: '雨过天晴',
        interpretation: '经历风雨，终见晴天。困难已过，好运将至，否极泰来。',
        level: 'good'
    },
    // 中签 (2签)
    {
        id: 11,
        name: '中签',
        luckyPhrase: '平安是福',
        interpretation: '平安即是福，平淡见真情。不求大富大贵，但求身体健康，家庭和睦。',
        level: 'average'
    },
    {
        id: 12,
        name: '中签',
        luckyPhrase: '细水长流',
        interpretation: '细水长流，积少成多。财富与福气慢慢积累，生活平稳安康。',
        level: 'average'
    }
];

// DOM 元素
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const hintText = document.getElementById('hint-text');
const countdownContainer = document.getElementById('countdown-container');
const countdownProgress = document.getElementById('countdown-progress');
const countdownNumber = document.getElementById('countdown-number');
const cardContainer = document.getElementById('card-container');
const card = document.getElementById('card');
const cardTitle = document.getElementById('card-title');
const cardLucky = document.getElementById('card-lucky');
const cardText = document.getElementById('card-text');
const drawButton = document.getElementById('draw-button');

// 状态变量
let isCountingDown = false;
let countdownStartTime = 0;
let countdownDuration = 3000; // 3秒
let handDetected = false;
let handDetectStart = 0;
let handStableDuration = 2000; // 2秒保持
let currentStick = null;
let animationFrameId = null;

// MediaPipe Hands 配置
const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands@0.4.1646424915/${file}`
});

hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

hands.onResults(onHandsResults);

// 摄像头初始化
async function initCamera() {
    try {
        // 设置 canvas 尺寸
        canvas.width = 200;
        canvas.height = 150;
        
        // 请求摄像头权限
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                width: { ideal: 200 }, 
                height: { ideal: 150 },
                facingMode: 'user'
            },
            audio: false
        });
        
        video.srcObject = stream;
        
        // 视频加载完成后开始检测
        video.onloadedmetadata = () => {
            video.play();
            startHandDetection();
        };
        
    } catch (error) {
        console.error('摄像头初始化失败:', error);
        hintText.textContent = '无法访问摄像头，请检查权限设置';
        throw error;
    }
}

// 手势检测循环
function startHandDetection() {
    console.log('手势检测循环已启动');
    async function detect() {
        if (video.readyState === 4) {
            try {
                await hands.send({ image: video });
            } catch (error) {
                console.error('手势检测失败:', error);
            }
        }
        requestAnimationFrame(detect);
    }
    detect();
}

// 手势检测结果处理
function onHandsResults(results) {
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 检查签卡是否显示
    const isCardVisible = cardContainer.style.display === 'block';

    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        console.log('检测到手掌');
        // 检测到手掌
        const landmarks = results.multiHandLandmarks[0];
        
        // 绘制手掌标记
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, 40, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 16px KaiTi';
        ctx.textAlign = 'center';
        ctx.fillText('手掌', canvas.width / 2, canvas.height / 2 + 5);

        // 检查是否已经在倒计时或签卡已显示
        if (!isCountingDown && !isCardVisible) {
            if (!handDetected) {
                console.log('开始保持手势计时');
                handDetected = true;
                handDetectStart = Date.now();
                hintText.textContent = '保持手势...';
            } else {
                const elapsed = Date.now() - handDetectStart;
                if (elapsed >= handStableDuration) {
                    // 手掌保持2秒，开始倒计时
                    console.log('保持手势2秒完成，开始倒计时');
                    startCountdown();
                } else {
                    // 显示保持进度（3...2...1...格式）
                    const remaining = Math.ceil((handStableDuration - elapsed) / 1000);
                    hintText.textContent = `保持手势 ${remaining}...`;
                }
            }
        }
    } else {
        // 未检测到手掌
        if (handDetected) {
            console.log('手掌消失，重置状态');
        }
        handDetected = false;
        if (!isCountingDown && !isCardVisible) {
            hintText.textContent = '请伸出手掌';
        }
    }
}

// 开始倒计时
function startCountdown() {
    console.log('开始3秒倒计时');
    isCountingDown = true;
    countdownStartTime = Date.now();
    countdownContainer.style.display = 'block';
    hintText.textContent = '';

    // 更新倒计时动画
    function updateCountdown() {
        const elapsed = Date.now() - countdownStartTime;
        const progress = Math.max(0, 1 - elapsed / countdownDuration);
        const remaining = Math.ceil(progress * 3);

        // 更新进度条
        const circumference = 2 * Math.PI * 55;
        countdownProgress.style.strokeDasharray = circumference;
        countdownProgress.style.strokeDashoffset = circumference * (1 - (1 - progress));

        // 更新数字
        countdownNumber.textContent = remaining;

        if (elapsed < countdownDuration) {
            animationFrameId = requestAnimationFrame(updateCountdown);
        } else {
            // 倒计时结束，抽签
            console.log('倒计时结束，开始抽签');
            drawFortuneStick();
        }
    }

    updateCountdown();
}

// 抽签
function drawFortuneStick() {
    console.log('执行抽签');
    // 停止倒计时
    isCountingDown = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    // 隐藏倒计时
    countdownContainer.style.display = 'none';

    // 随机选择签
    const randomIndex = Math.floor(Math.random() * fortuneSticks.length);
    currentStick = fortuneSticks[randomIndex];
    console.log(`抽到第${currentStick.id}签: ${currentStick.name} - ${currentStick.luckyPhrase}`);

    // 更新签卡内容
    card.className = `card ${currentStick.level}`;
    cardTitle.textContent = currentStick.name;
    cardLucky.textContent = currentStick.luckyPhrase;
    cardText.textContent = currentStick.interpretation;

    // 显示签卡
    cardContainer.style.display = 'block';
    console.log('签卡已显示');

    // 延迟显示按钮
    setTimeout(() => {
        drawButton.style.display = 'block';
        console.log('再抽一签按钮已显示');
    }, 1000);
}

// 再抽一签
function resetAndRedraw() {
    // 隐藏签卡和按钮
    cardContainer.style.display = 'none';
    drawButton.style.display = 'none';
    hintText.textContent = '请伸出手掌';
    
    // 重置状态
    handDetected = false;
    currentStick = null;
}

// 初始化
async function init() {
    try {
        hintText.textContent = '正在启动摄像头...';
        await initCamera();
        hintText.textContent = '请伸出手掌';
    } catch (error) {
        console.error('摄像头启动失败:', error);
        hintText.textContent = '无法访问摄像头，请检查权限';
    }
}

// 事件监听
drawButton.addEventListener('click', resetAndRedraw);

// 启动应用
init();