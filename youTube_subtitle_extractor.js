// ==UserScript==
// @name         YouTube 字幕时间范围提取工具
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  选择时间范围并获取对应的字幕文本，支持复制到剪贴板
// @author       Doubao
// @match        *://www.youtube.com/watch*
// @updateURL    https://raw.githubusercontent.com/duanwandao/tampermonkey-scripts/refs/heads/main/youTube_subtitle_extractor.js
// @downloadURL  https://raw.githubusercontent.com/duanwandao/tampermonkey-scripts/refs/heads/main/youTube_subtitle_extractor.js
// @grant        GM_addStyle
// @grant        navigator.clipboard
// ==/UserScript==

(function() {
    'use strict';
    
    // 添加样式
    GM_addStyle(`
        #time-range-selector {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: flex;
            flex-direction: column;
            align-items: center;
            cursor: move; /* 鼠标指针显示为移动图标 */
        }
        .time-input-container {
            display: flex;
            margin-bottom: 15px;
            gap: 20px;
        }
        .time-input-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .time-label {
            font-size: 14px;
            margin-bottom: 5px;
            color: #555;
        }
        .time-input {
            width: 80px;
            height: 36px;
            padding: 0 10px;
            font-size: 16px;
            border: 1px solid #ddd;
            border-radius: 4px;
            text-align: center;
            outline: none;
            transition: border-color 0.2s;
        }
        .time-input:focus {
            border-color: #4285f4;
        }
        .btn {
            height: 40px;
            padding: 0 20px;
            background: #4285f4;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s;
        }
        .btn:hover {
            background: #3367d6;
        }
        #result-display {
            position: fixed;
            top: 90px;
            left: 50%;
            transform: translateX(-50%);
            background: white;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            z-index: 9998;
            max-width: 80%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: none;
            font-size: 15px;
            line-height: 1.5;
            word-break: break-word;
        }
        .result-title {
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
        }
    `);
    
    // 创建时间选择器界面
    function createTimeSelector() {
        const selector = document.createElement('div');
        selector.id = 'time-range-selector';
        
        const timeInputContainer = document.createElement('div');
        timeInputContainer.className = 'time-input-container';
        
        // 开始时间输入
        const startWrapper = document.createElement('div');
        startWrapper.className = 'time-input-wrapper';
        const startLabel = document.createElement('div');
        startLabel.className = 'time-label';
        startLabel.textContent = '开始时间 (分:秒)';
        const startInput = document.createElement('input');
        startInput.className = 'time-input';
        startInput.type = 'text';
        startInput.placeholder = '0:00';
        startInput.value = '0:00';
        
        // 结束时间输入
        const endWrapper = document.createElement('div');
        endWrapper.className = 'time-input-wrapper';
        const endLabel = document.createElement('div');
        endLabel.className = 'time-label';
        endLabel.textContent = '结束时间 (分:秒)';
        const endInput = document.createElement('input');
        endInput.className = 'time-input';
        endInput.type = 'text';
        endInput.placeholder = '0:00';
        endInput.value = getLastTimestamp(); // 默认设置为最后一个时间戳
        
        startWrapper.appendChild(startLabel);
        startWrapper.appendChild(startInput);
        endWrapper.appendChild(endLabel);
        endWrapper.appendChild(endInput);
        timeInputContainer.appendChild(startWrapper);
        timeInputContainer.appendChild(endWrapper);
        
        const getBtn = document.createElement('button');
        getBtn.className = 'btn';
        getBtn.textContent = '提取时间范围内的字幕';
        
        const resultDisplay = document.createElement('div');
        resultDisplay.id = 'result-display';
        
        // 使用安全的方式设置初始HTML内容
        setTrustedHTML(resultDisplay, '<div class="result-title">结果将显示在这里</div>');
        
        selector.appendChild(timeInputContainer);
        selector.appendChild(getBtn);
        document.body.appendChild(selector);
        document.body.appendChild(resultDisplay);
        
        // 添加拖拽功能
        makeElementDraggable(selector);
        
        // 按钮点击事件
        getBtn.addEventListener('click', function() {
            const startTime = startInput.value.trim();
            const endTime = endInput.value.trim();
            
            if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
                showResult('请输入有效的时间格式 (例如: 1:30)', false);
                return;
            }
            
            const startTimeSec = timeToSeconds(startTime);
            const endTimeSec = timeToSeconds(endTime);
            
            const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
            let resultText = '';
            let segmentCount = 0;
            
            segments.forEach(segment => {
                const timestampEl = segment.querySelector('.segment-timestamp');
                const textEl = segment.querySelector('.segment-text');
                
                if (timestampEl && textEl) {
                    const timestamp = timestampEl.textContent.trim();
                    const text = textEl.textContent.trim();
                    const timestampSec = timeToSeconds(timestamp);
                    
                    if (timestampSec >= startTimeSec && timestampSec <= endTimeSec) {
                        resultText += text + ' ';
                        segmentCount++;
                    }
                }
            });
            
            if (segmentCount === 0) {
                showResult(`在 ${startTime} 到 ${endTime} 范围内未找到字幕`, false);
            } else {
                showResult(`成功提取 ${segmentCount} 个时间段的字幕:`, true, resultText);
                
                // 打印到控制台
                console.log(`===== 时间范围: ${startTime} - ${endTime} =====`);
                console.log(resultText);
                console.log(`===== 共 ${segmentCount} 个时间段 =====`);
            }
        });
        
        // 显示结果函数
        function showResult(title, hasText = true, text = '') {
            // 使用DOM操作清空容器，而不是使用innerHTML
            while (resultDisplay.firstChild) {
                resultDisplay.removeChild(resultDisplay.firstChild);
            }
            
            const resultTitle = document.createElement('div');
            resultTitle.className = 'result-title';
            resultTitle.textContent = title;
            resultDisplay.appendChild(resultTitle);
            
            if (hasText) {
                const resultText = document.createElement('div');
                resultText.className = 'result-text';
                resultText.textContent = text;
                resultDisplay.appendChild(resultText);
                
                // 复制到剪贴板
                copyToClipboard(text)
                    .then(() => {
                        const successMsg = document.createElement('div');
                        successMsg.style.cssText = 'margin-top: 10px; color: #4285f4; font-size: 14px;';
                        successMsg.textContent = '✅ 字幕已成功复制到剪贴板';
                        resultDisplay.appendChild(successMsg);
                    })
                    .catch(err => {
                        const errorMsg = document.createElement('div');
                        errorMsg.style.cssText = 'margin-top: 10px; color: #e53935; font-size: 14px;';
                        errorMsg.textContent = `❌ 复制失败: ${err.message || err}`;
                        resultDisplay.appendChild(errorMsg);
                    });
            }
            
            resultDisplay.style.display = 'block';
            
            // 30秒后自动隐藏结果框
            setTimeout(() => {
                resultDisplay.style.display = 'none';
            }, 30000);
        }
    }
    
    // 使元素可拖拽的函数
    function makeElementDraggable(element) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
        
        // 鼠标按下事件
        element.onmousedown = dragStart;
        
        // 开始拖拽
        function dragStart(e) {
            e.preventDefault();
            
            // 获取鼠标位置
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // 添加鼠标移动和释放事件
            document.onmousemove = dragElement;
            document.onmouseup = stopDragging;
        }
        
        // 拖拽元素
        function dragElement(e) {
            e.preventDefault();
            
            // 计算新位置
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            
            // 设置新位置
            element.style.top = (element.offsetTop - pos2) + "px";
            element.style.left = (element.offsetLeft - pos1) + "px";
            
            // 防止拖拽到窗口外
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const elementWidth = element.offsetWidth;
            const elementHeight = element.offsetHeight;
            
            if (element.offsetLeft < 0) {
                element.style.left = "0px";
            }
            if (element.offsetTop < 0) {
                element.style.top = "0px";
            }
            if (element.offsetLeft + elementWidth > windowWidth) {
                element.style.left = (windowWidth - elementWidth) + "px";
            }
            if (element.offsetTop + elementHeight > windowHeight) {
                element.style.top = (windowHeight - elementHeight) + "px";
            }
        }
        
        // 停止拖拽
        function stopDragging() {
            document.onmousemove = null;
            document.onmouseup = null;
        }
    }
    
    // 验证时间格式 (mm:ss)
    function isValidTimeFormat(timeStr) {
        const regex = /^(\d+):(\d{2})$/;
        return regex.test(timeStr);
    }
    
    // 将时间字符串转换为秒数
    function timeToSeconds(timeStr) {
        const [minutes, seconds] = timeStr.split(':').map(Number);
        return minutes * 60 + seconds;
    }
    
    // 获取最后一个时间戳作为默认结束时间
    function getLastTimestamp() {
        const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (segments.length > 0) {
            const lastSegment = segments[segments.length - 1];
            const timestampEl = lastSegment.querySelector('.segment-timestamp');
            if (timestampEl) {
                return timestampEl.textContent.trim();
            }
        }
        return '10:00'; // 默认设置为10分钟
    }
    
    // 安全设置HTML内容的辅助函数
    function setTrustedHTML(element, htmlString) {
        if (typeof trustedTypes !== 'undefined') {
            const policy = trustedTypes.createPolicy('myPolicy', {
                createHTML: (string) => string
            });
            element.innerHTML = policy.createHTML(htmlString);
        } else {
            element.innerHTML = htmlString;
        }
    }
    
    // 复制文本到剪贴板的辅助函数
    function copyToClipboard(text) {
        return new Promise((resolve, reject) => {
            // 检查是否支持新的剪贴板API
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text)
                    .then(resolve)
                    .catch(err => {
                        console.warn('新API复制失败，尝试备用方法:', err);
                        fallbackCopyToClipboard(text, resolve, reject);
                    });
            } else {
                console.log('不支持新API，使用备用方法');
                fallbackCopyToClipboard(text, resolve, reject);
            }
        });
    }
    
    // 备用复制方法 - 使用execCommand
    function fallbackCopyToClipboard(text, resolve, reject) {
        try {
            // 创建临时文本区域
            const textArea = document.createElement('textarea');
            textArea.value = text;
            
            // 使其不在视口中
            textArea.style.position = 'fixed';
            textArea.style.top = '-9999px';
            textArea.style.left = '-9999px';
            
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            // 执行复制命令
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
                resolve();
            } else {
                reject(new Error('复制命令执行失败'));
            }
        } catch (err) {
            reject(err);
        }
    }
    
    // 等待字幕元素加载
    function waitForSubtitles() {
        if (document.querySelector('ytd-transcript-segment-renderer')) {
            createTimeSelector();
        } else {
            setTimeout(waitForSubtitles, 1000);
        }
    }
    
    // 页面加载完成后执行
    waitForSubtitles();
})();
