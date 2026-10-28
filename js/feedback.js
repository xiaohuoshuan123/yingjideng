/**
 * yingjideng 反馈页面 JS
 * 加载工具列表、表单提交、本地存储
 */

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('feedback-form');
  const toolSelect = document.getElementById('tool_select');
  const toolIdInput = document.getElementById('tool_id');
  const toolNameInput = document.getElementById('tool_name');
  
  // 从 URL 参数获取工具信息
  const urlParams = new URLSearchParams(window.location.search);
  const toolId = urlParams.get('tool_id');
  const toolName = urlParams.get('tool_name');
  
  if (toolId) {
    toolIdInput.value = toolId;
  }
  if (toolName) {
    toolNameInput.value = toolName;
  }
  
  // 加载工具列表
  loadToolList();
  
  // 同步工具选择
  toolSelect.addEventListener('change', function() {
    const selected = toolSelect.options[toolSelect.selectedIndex];
    toolIdInput.value = selected.dataset.toolId || '';
    toolNameInput.value = selected.dataset.toolName || '';
  });
  
  // 表单提交
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // 获取表单数据
    const formData = new FormData(form);
    const data = {
      feedback_type: formData.get('feedback_type') || '',
      tool_id: toolIdInput.value || '',
      tool_name: toolNameInput.value || '',
      email: formData.get('email') || '',
      content: formData.get('content')
    };
    
    // 验证 - 移除 10 字符限制，改为至少 2 字符
    if (!data.content || data.content.trim().length < 2) {
      alert('反馈内容至少需要 2 个字符');
      return;
    }
    
    // 显示加载状态
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-block';
    
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // 显示成功提示
        form.style.display = 'none';
        document.getElementById('success-message').style.display = 'block';
        console.log('Feedback submitted:', result);
      } else {
        throw new Error(result.error || '提交失败');
      }
    } catch (error) {
      // 显示错误提示
      form.style.display = 'none';
      document.getElementById('error-message').style.display = 'block';
      document.getElementById('error-text').textContent = error.message;
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoading.style.display = 'none';
    }
  });
});

// 加载工具列表
async function loadToolList() {
  const toolSelect = document.getElementById('tool_select');
  
  try {
    const response = await fetch('data/tools.json');
    const data = await response.json();
    
    // data 结构: { categories: [{ id, name, tools: [...] }] }
    const categories = data.categories || [];
    
    // 按分类分组
    categories.forEach(category => {
      const optgroup = document.createElement('optgroup');
      optgroup.label = category.name;
      
      (category.tools || []).forEach(tool => {
        const option = document.createElement('option');
        option.value = tool.id;
        option.textContent = tool.name;
        option.dataset.toolId = tool.id;
        option.dataset.toolName = tool.name;
        optgroup.appendChild(option);
      });
      
      toolSelect.appendChild(optgroup);
    });
    
    // 如果有工具，自动选择第一个
    if (toolSelect.options.length > 1) {
      // 保持默认选项
    }
  } catch (error) {
    console.error('Failed to load tools:', error);
    // 显示错误提示
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-warning mt-3';
    errorDiv.textContent = '⚠️ 无法加载工具列表，请刷新页面重试';
    toolSelect.parentElement.appendChild(errorDiv);
  }
}
