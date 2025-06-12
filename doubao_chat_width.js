// ==UserScript==
// @name         豆包对话宽度增强
// @namespace    http://tampermonkey.net/
// @version      2025-06-12
// @description  将豆包对话页面的最大宽度从450px增加到900px
// @author       断弯刀
// @match        https://www.doubao.com/chat/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=doubao.com
// @updateURL    https://raw.githubusercontent.com/duanwandao/tampermonkey-scripts/refs/heads/main/doubao_chat_width.js
// @downloadURL  https://raw.githubusercontent.com/duanwandao/tampermonkey-scripts/refs/heads/main/doubao_chat_width.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 定义日志前缀常量
    const LOG_PREFIX = '【豆包对话宽度增强脚本】';

    // 定义修改元素宽度的函数
    function modifyElementWidth() {
        // 查找所有具有max-w-450类的元素
        const elements = document.querySelectorAll('.max-w-450');

        // 如果找到元素，则修改其max-width属性
        if (elements.length > 0) {
            elements.forEach(element => {
                element.style.maxWidth = '900px';
            });
            console.log(LOG_PREFIX, '已修改', elements.length, '个元素的最大宽度');
        } else {
            console.log(LOG_PREFIX, '未找到具有max-w-450类的元素');
        }
    }

    // 页面加载完成后立即执行一次
    window.addEventListener('load', function() {
        modifyElementWidth();
        console.log(LOG_PREFIX, '页面加载完成，已执行宽度调整');
    });

    // 创建一个MutationObserver来监听DOM变化
    const observer = new MutationObserver(function(mutations) {
        // 检查是否有新元素被添加到DOM中
        mutations.forEach(function(mutation) {
            if (mutation.addedNodes.length > 0) {
                modifyElementWidth();
                console.log(LOG_PREFIX, '检测到DOM变化，已执行宽度调整');
            }
        });
    });

    // 配置观察器监听整个文档的变化
    const observerConfig = {
        childList: true,
        subtree: true
    };

    // 开始观察文档变化
    observer.observe(document.body, observerConfig);
    console.log(LOG_PREFIX, '已启动DOM变化监听');

    // 页面URL变化时也执行一次（用于处理单页应用的路由变化）
    window.addEventListener('popstate', function() {
        setTimeout(modifyElementWidth, 500);
        console.log(LOG_PREFIX, '检测到URL变化，已执行宽度调整');
    });
})();
