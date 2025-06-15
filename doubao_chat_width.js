// ==UserScript==
// @name         豆包对话宽度增强
// @namespace    http://tampermonkey.net/
// @version      2025-06-14
// @description  将豆包对话页面的最大宽度从450px增加到900px，并修改背景色
// @author       断弯刀
// @match        https://www.doubao.com/chat/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=doubao.com
// @updateURL    https://github.com/duanwandao/tampermonkey-scripts/blob/main/doubao_chat_width.js
// @downloadURL  https://github.com/duanwandao/tampermonkey-scripts/blob/main/doubao_chat_width.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 配置常量
    const CONFIG = {
        LOG_PREFIX: '【豆包对话宽度增强脚本】',
        TARGET_WIDTH: '900px',
        // TARGET_BG_COLOR: '#eff6ff',
        SELECTORS: {
            CONTAINER: '.max-w-450', // 对话容器选择器
            MESSAGE: '.markdown-body' // 消息内容选择器
        }
    };

    // 修改元素样式的函数
    function modifyElementStyles() {
        const containers = document.querySelectorAll(CONFIG.SELECTORS.CONTAINER);
        const messages = document.querySelectorAll(CONFIG.SELECTORS.MESSAGE);

        if (containers.length > 0) {
            containers.forEach(container => {
                container.style.maxWidth = CONFIG.TARGET_WIDTH;
                container.style.backgroundColor = CONFIG.TARGET_BG_COLOR;
            });

            console.log(CONFIG.LOG_PREFIX, `已修改 ${containers.length} 个容器宽度，${messages.length} 个消息背景色`);
        } else {
            console.log(CONFIG.LOG_PREFIX, '未找到目标元素');
        }
    }

    // 页面加载完成后执行
    window.addEventListener('load', () => {
        modifyElementStyles();
        console.log(CONFIG.LOG_PREFIX, '页面加载完成，已执行样式调整');
    });

    // 监听DOM变化
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.addedNodes.length > 0) {
                modifyElementStyles();
                console.log(CONFIG.LOG_PREFIX, '检测到DOM变化，已执行样式调整');
            }
        });
    });

    // 配置并启动观察器
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
    console.log(CONFIG.LOG_PREFIX, '已启动DOM变化监听');

    // 处理单页应用路由变化
    window.addEventListener('popstate', () => {
        setTimeout(modifyElementStyles, 500);
        console.log(CONFIG.LOG_PREFIX, '检测到URL变化，已执行样式调整');
    });
})();
