// background.js - Chrome Extension Service Worker

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message);
  
  // 可以在这里添加其他非AI相关的消息处理逻辑
  
  // 返回false表示同步响应
  return false;
});

// 扩展安装时的初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log('FuncAvatar extension installed');
});

// 扩展启动时的初始化
chrome.runtime.onStartup.addListener(() => {
  console.log('FuncAvatar extension started');
});