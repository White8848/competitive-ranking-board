// 比赛队伍排名系统

// 示例数据结构 - 替换为从金山文档获取的实际数据
const sampleData = [
    { team: '雄鹰队', wins: 15, losses: 3, points: 45 },
    { team: '猛虎队', wins: 13, losses: 5, points: 41 },
    { team: '飞龙队', wins: 12, losses: 6, points: 38 },
    { team: '闪电队', wins: 10, losses: 8, points: 32 },
    { team: '狂狼队', wins: 9, losses: 9, points: 30 },
    { team: '烈火队', wins: 8, losses: 10, points: 28 },
    { team: '巨人队', wins: 7, losses: 11, points: 25 },
    { team: '勇士队', wins: 6, losses: 12, points: 22 },
    { team: '疾风队', wins: 5, losses: 13, points: 19 },
    { team: '雷霆队', wins: 3, losses: 15, points: 15 }
];

let teamsData = [];
let autoRefreshInterval = null;
let isAutoRefreshEnabled = false;
let featuredTeamNames = []; // 存储关注的战队名称

// 初始化时加载关注的战队
function loadFeaturedTeams() {
    const saved = localStorage.getItem('featuredTeams');
    if (saved) {
        try {
            featuredTeamNames = JSON.parse(saved);
        } catch (e) {
            featuredTeamNames = ['星河战魂', '幻影战翼']; // 默认
        }
    } else {
        featuredTeamNames = ['星河战魂', '幻影战翼']; // 默认
    }
}

// 保存关注的战队
function saveFeaturedTeams() {
    localStorage.setItem('featuredTeams', JSON.stringify(featuredTeamNames));
}

// DOM元素
const loadDataBtn = document.getElementById('loadData');
const loadFromKDocsBtn = document.getElementById('loadFromKDocs');
const refreshRankingBtn = document.getElementById('refreshRanking');
const dataSourceSelect = document.getElementById('dataSource');
const kdocsSection = document.getElementById('kdocsSection');
const dataInputSection = document.getElementById('dataInputSection');
const pasteArea = document.getElementById('pasteArea');
const parseTableDataBtn = document.getElementById('parseTableData');
const csvFileInput = document.getElementById('csvFile');
const uploadCSVBtn = document.getElementById('uploadCSV');
const csvInput = document.getElementById('csvInput');
const parseDataBtn = document.getElementById('parseData');
const rankingBody = document.getElementById('rankingBody');
const lastUpdateSpan = document.getElementById('lastUpdate');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadFeaturedTeams();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    if (loadDataBtn) loadDataBtn.addEventListener('click', loadSampleData);
    if (loadFromKDocsBtn) {
        loadFromKDocsBtn.addEventListener('click', () => {
            if (dataSourceSelect) dataSourceSelect.value = 'kdocs';
            handleDataSourceChange();
        });
    }
    if (refreshRankingBtn) refreshRankingBtn.addEventListener('click', refreshRanking);
    if (dataSourceSelect) dataSourceSelect.addEventListener('change', handleDataSourceChange);
    if (parseTableDataBtn) parseTableDataBtn.addEventListener('click', parseTableData);
    if (uploadCSVBtn) uploadCSVBtn.addEventListener('click', handleCSVUpload);
    if (csvFileInput) csvFileInput.addEventListener('change', handleFileSelect);
    if (parseDataBtn) parseDataBtn.addEventListener('click', parseCSVData);
    
    // 自动刷新控制
    const autoRefreshCheckbox = document.getElementById('autoRefresh');
    const refreshIntervalSelect = document.getElementById('refreshInterval');
    const quickReadBtn = document.getElementById('quickRead');
    
    if (autoRefreshCheckbox) {
        autoRefreshCheckbox.addEventListener('change', toggleAutoRefresh);
    }
    if (refreshIntervalSelect) {
        refreshIntervalSelect.addEventListener('change', updateRefreshInterval);
    }
    if (quickReadBtn) {
        quickReadBtn.addEventListener('click', readFromClipboard);
    }
    
    // 关注战队管理
    const manageFeaturedBtn = document.getElementById('manageFeatured');
    const featuredModal = document.getElementById('featuredModal');
    const closeModalBtn = document.getElementById('closeModal');
    const addFeaturedBtn = document.getElementById('addFeatured');
    
    if (manageFeaturedBtn) {
        manageFeaturedBtn.addEventListener('click', () => {
            updateTeamSelector();
            updateFeaturedList();
            featuredModal.style.display = 'flex';
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            featuredModal.style.display = 'none';
        });
    }
    
    if (featuredModal) {
        featuredModal.addEventListener('click', (e) => {
            if (e.target === featuredModal) {
                featuredModal.style.display = 'none';
            }
        });
    }
    
    if (addFeaturedBtn) {
        addFeaturedBtn.addEventListener('click', addFeaturedTeam);
    }
    
    // 输入框回车键添加
    const teamInput = document.getElementById('teamInput');
    if (teamInput) {
        teamInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addFeaturedTeam();
            }
        });
    }
    
    console.log('事件监听器已设置');
    console.log('DOM元素检查:', {
        loadDataBtn: !!loadDataBtn,
        loadFromKDocsBtn: !!loadFromKDocsBtn,
        refreshRankingBtn: !!refreshRankingBtn,
        parseTableDataBtn: !!parseTableDataBtn
    });
}

// 加载示例数据
function loadSampleData() {
    teamsData = [...sampleData];
    calculateAndDisplayRanking();
    updateLastUpdateTime();
    showNotification('示例数据已加载', 'success');
}

// 处理数据源切换
function handleDataSourceChange() {
    const source = dataSourceSelect.value;
    kdocsSection.style.display = 'none';
    dataInputSection.style.display = 'none';
    
    if (source === 'kdocs') {
        kdocsSection.style.display = 'block';
    } else if (source === 'manual') {
        dataInputSection.style.display = 'block';
    }
}

// 解析CSV数据
function parseCSVData() {
    const csvText = csvInput.value.trim();
    if (!csvText) {
        showNotification('请输入CSV数据', 'error');
        return;
    }

    try {
        const lines = csvText.split('\n');
        teamsData = [];

        lines.forEach(line => {
            const parts = line.split(',').map(p => p.trim());
            if (parts.length >= 4) {
                teamsData.push({
                    team: parts[0],
                    wins: parseInt(parts[1]) || 0,
                    losses: parseInt(parts[2]) || 0,
                    points: parseInt(parts[3]) || 0
                });
            }
        });

        if (teamsData.length > 0) {
            calculateAndDisplayRanking();
            updateLastUpdateTime();
            showNotification(`成功解析 ${teamsData.length} 支队伍数据`, 'success');
        } else {
            showNotification('未能解析任何数据，请检查格式', 'error');
        }
    } catch (error) {
        showNotification('数据解析错误: ' + error.message, 'error');
    }
}

// 计算并显示排名
function calculateAndDisplayRanking() {
    if (teamsData.length === 0) {
        rankingBody.innerHTML = '<tr><td colspan="9" class="no-data">暂无数据</td></tr>';
        return;
    }

    // 计算总积分并排序
    const rankedTeams = teamsData
        .map(team => ({
            ...team,
            totalMatches: team.wins + team.losses,
            totalWinLossScore: team.points, // 胜负分总和
            winRate: team.wins + team.losses > 0 
                ? ((team.wins / (team.wins + team.losses)) * 100).toFixed(1)
                : 0
        }))
        .sort((a, b) => {
            // 首先按胜负分总和排序
            if (b.totalWinLossScore !== a.totalWinLossScore) {
                return b.totalWinLossScore - a.totalWinLossScore;
            }
            // 胜负分相同则按净胜分排序
            if (b.netScore !== a.netScore) {
                return b.netScore - a.netScore;
            }
            // 净胜分相同则按胜场数排序
            if (b.wins !== a.wins) {
                return b.wins - a.wins;
            }
            // 胜场相同则按总分排序
            return b.totalScore - a.totalScore;
        });

    // 更新统计数据
    updateStatistics(rankedTeams);

    // 渲染排名表格
    renderRankingTable(rankedTeams);
}

// 更新统计数据
function updateStatistics(rankedTeams) {
    const totalTeams = rankedTeams.length;
    const totalMatches = rankedTeams.reduce((sum, team) => sum + team.totalMatches, 0);
    const avgScore = totalTeams > 0 
        ? (rankedTeams.reduce((sum, team) => sum + team.totalWinLossScore, 0) / totalTeams).toFixed(1)
        : 0;

    document.getElementById('totalTeams').textContent = totalTeams;
    document.getElementById('totalMatches').textContent = totalMatches;
    document.getElementById('avgScore').textContent = avgScore;
    
    // 更新重点关注战队
    updateFeaturedTeams(rankedTeams);
}

// 更新重点关注战队的显示
function updateFeaturedTeams(rankedTeams) {
    const featuredTeamsContainer = document.getElementById('featuredTeams');
    const featuredTeamsGrid = document.getElementById('featuredTeamsGrid');
    
    if (!featuredTeamsContainer || !featuredTeamsGrid) return;
    
    // 清空现有卡片
    featuredTeamsGrid.innerHTML = '';
    
    let foundAny = false;
    
    featuredTeamNames.forEach(teamName => {
        const team = rankedTeams.find(t => t.team === teamName);
        
        if (team) {
            foundAny = true;
            const rank = rankedTeams.indexOf(team) + 1;
            
            // 创建卡片
            const card = document.createElement('div');
            card.className = 'featured-team-card';
            
            let rankColor = '#667eea';
            if (rank === 1) rankColor = '#ffd700';
            else if (rank === 2) rankColor = '#c0c0c0';
            else if (rank === 3) rankColor = '#cd7f32';
            
            const netScoreColor = team.netScore >= 0 ? '#28a745' : '#dc3545';
            const netScoreText = team.netScore > 0 ? `+${team.netScore}` : team.netScore;
            
            card.innerHTML = `
                <div class="featured-team-header">
                    <h3>🌟 ${escapeHtml(teamName)}</h3>
                    <div class="featured-rank" style="color: ${rankColor}">排名: <span>${rank}</span></div>
                </div>
                <div class="featured-team-stats">
                    <div class="stat-item">
                        <span class="stat-label">胜负分</span>
                        <span class="stat-value highlight">${team.totalWinLossScore}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">净胜分</span>
                        <span class="stat-value" style="color: ${netScoreColor}">${netScoreText}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">胜场</span>
                        <span class="stat-value">${team.wins}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">负场</span>
                        <span class="stat-value">${team.losses}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">胜率</span>
                        <span class="stat-value">${team.winRate}%</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">总分</span>
                        <span class="stat-value">${team.totalScore}</span>
                    </div>
                </div>
            `;
            
            featuredTeamsGrid.appendChild(card);
        }
    });
    
    // 显示或隐藏重点关注区域
    featuredTeamsContainer.style.display = foundAny ? 'block' : 'none';
}

// 更新战队建议列表
function updateTeamSelector() {
    const datalist = document.getElementById('teamSuggestions');
    if (!datalist) return;
    
    // 清空现有选项
    datalist.innerHTML = '';
    
    // 添加所有战队作为建议
    teamsData.forEach(team => {
        const option = document.createElement('option');
        option.value = team.team;
        datalist.appendChild(option);
    });
}

// 更新关注列表
function updateFeaturedList() {
    const list = document.getElementById('featuredList');
    if (!list) return;
    
    list.innerHTML = '';
    
    if (featuredTeamNames.length === 0) {
        list.innerHTML = '<li class="empty-message">暂无关注的战队</li>';
        return;
    }
    
    featuredTeamNames.forEach(teamName => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span class="team-name">${escapeHtml(teamName)}</span>
            <button class="btn-remove" data-team="${escapeHtml(teamName)}">×</button>
        `;
        
        const removeBtn = li.querySelector('.btn-remove');
        removeBtn.addEventListener('click', () => removeFeaturedTeam(teamName));
        
        list.appendChild(li);
    });
}

// 添加关注战队
function addFeaturedTeam() {
    const input = document.getElementById('teamInput');
    const teamName = input.value.trim();
    
    if (!teamName) {
        showNotification('请输入战队名称', 'error');
        return;
    }
    
    if (featuredTeamNames.includes(teamName)) {
        showNotification('该战队已在关注列表中', 'error');
        return;
    }
    
    featuredTeamNames.push(teamName);
    saveFeaturedTeams();
    updateTeamSelector();
    updateFeaturedList();
    
    // 刷新显示
    if (teamsData.length > 0) {
        calculateAndDisplayRanking();
    }
    
    showNotification(`已添加关注: ${teamName}`, 'success');
    
    // 清空输入框并获得焦点
    input.value = '';
    input.focus();
}

// 移除关注战队
function removeFeaturedTeam(teamName) {
    const index = featuredTeamNames.indexOf(teamName);
    if (index > -1) {
        featuredTeamNames.splice(index, 1);
        saveFeaturedTeams();
        updateTeamSelector();
        updateFeaturedList();
        
        // 刷新显示
        if (teamsData.length > 0) {
            calculateAndDisplayRanking();
        }
        
        showNotification(`已移除关注: ${teamName}`, 'info');
    }
}

// 渲染排名表格
function renderRankingTable(rankedTeams) {
    rankingBody.innerHTML = '';

    rankedTeams.forEach((team, index) => {
        const rank = index + 1;
        const row = document.createElement('tr');
        
        // 为前三名添加特殊样式
        if (rank === 1) row.classList.add('rank-1');
        else if (rank === 2) row.classList.add('rank-2');
        else if (rank === 3) row.classList.add('rank-3');

        row.innerHTML = `
            <td class="rank-col">
                ${rank <= 3 ? getMedalEmoji(rank) : rank}
            </td>
            <td class="team-col">${escapeHtml(team.team)}</td>
            <td class="number-col">${team.wins}</td>
            <td class="number-col">${team.losses}</td>
            <td class="number-col">${team.totalMatches}</td>
            <td class="number-col">${team.winRate}%</td>
            <td class="score-col"><strong>${team.totalWinLossScore}</strong></td>
            <td class="number-col" style="color: ${team.netScore >= 0 ? '#28a745' : '#dc3545'}">
                <strong>${team.netScore > 0 ? '+' : ''}${team.netScore}</strong>
            </td>
            <td class="number-col">${team.totalScore}</td>
        `;

        rankingBody.appendChild(row);
    });
}

// 获取奖牌emoji
function getMedalEmoji(rank) {
    const medals = {
        1: '🥇',
        2: '🥈',
        3: '🥉'
    };
    return medals[rank] || rank;
}

// 刷新排名
function refreshRanking() {
    if (teamsData.length === 0) {
        showNotification('没有数据可刷新', 'error');
        return;
    }
    calculateAndDisplayRanking();
    updateLastUpdateTime();
    showNotification('排名已刷新', 'success');
}

// 更新最后更新时间
function updateLastUpdateTime() {
    const now = new Date();
    const timeString = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    lastUpdateSpan.textContent = timeString;
}

// 显示通知
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 动画显示
    setTimeout(() => notification.classList.add('show'), 10);
    
    // 3秒后移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// HTML转义防止XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 从剪贴板快速读取
async function readFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        if (!text) {
            showNotification('剪贴板为空', 'error');
            return;
        }
        
        // 自动填充到粘贴区域
        const pasteArea = document.getElementById('pasteArea');
        if (pasteArea) {
            pasteArea.value = text;
            // 自动解析
            parseTableData();
        }
    } catch (error) {
        showNotification('无法读取剪贴板，请手动粘贴（需要浏览器权限）', 'error');
        console.error('剪贴板读取错误:', error);
    }
}

// 切换自动刷新
function toggleAutoRefresh() {
    const checkbox = document.getElementById('autoRefresh');
    const intervalSelect = document.getElementById('refreshInterval');
    
    if (checkbox && checkbox.checked) {
        if (teamsData.length === 0) {
            showNotification('请先加载数据后再启用自动刷新', 'error');
            checkbox.checked = false;
            return;
        }
        
        isAutoRefreshEnabled = true;
        const interval = parseInt(intervalSelect?.value || 30) * 1000;
        startAutoRefresh(interval);
        showNotification(`自动刷新已启用（每${interval/1000}秒）`, 'success');
    } else {
        isAutoRefreshEnabled = false;
        stopAutoRefresh();
        showNotification('自动刷新已停止', 'info');
    }
}

// 更新刷新间隔
function updateRefreshInterval() {
    if (isAutoRefreshEnabled) {
        stopAutoRefresh();
        const intervalSelect = document.getElementById('refreshInterval');
        const interval = parseInt(intervalSelect?.value || 30) * 1000;
        startAutoRefresh(interval);
        showNotification(`刷新间隔已更新为${interval/1000}秒`, 'info');
    }
}

// 启动自动刷新
function startAutoRefresh(interval) {
    stopAutoRefresh(); // 清除旧的定时器
    
    autoRefreshInterval = setInterval(async () => {
        console.log('自动刷新: 尝试从剪贴板读取...');
        
        // 提示用户复制新数据
        const notification = document.createElement('div');
        notification.className = 'notification notification-info auto-refresh-notice';
        notification.innerHTML = '🔄 自动刷新：请复制最新表格数据...';
        document.body.appendChild(notification);
        setTimeout(() => notification.classList.add('show'), 10);
        
        // 等待用户复制（给3秒时间）
        setTimeout(async () => {
            try {
                const text = await navigator.clipboard.readText();
                if (text && text.length > 50) { // 确保有足够的数据
                    const pasteArea = document.getElementById('pasteArea');
                    if (pasteArea) {
                        pasteArea.value = text;
                        parseTableData();
                    }
                }
            } catch (error) {
                console.log('自动刷新: 无法读取剪贴板', error);
            }
            
            // 移除提示
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }, interval);
}

// 停止自动刷新
function stopAutoRefresh() {
    if (autoRefreshInterval) {
        clearInterval(autoRefreshInterval);
        autoRefreshInterval = null;
    }
}

// 解析粘贴的表格数据
function parseTableData() {
    const text = pasteArea.value.trim();
    if (!text) {
        showNotification('请先粘贴表格数据', 'error');
        return;
    }

    try {
        const lines = text.split('\n').filter(line => line.trim());
        
        // 创建战队数据映射
        const teamMap = new Map();
        
        // 跳过第一行（标题行）
        for (let i = 1; i < lines.length; i++) {
            // 使用制表符分隔
            const parts = lines[i].split(/\t/).map(p => p.trim());
            
            if (parts.length >= 16) {
                // 提取战队名称和分数
                const redTeam1Name = parts[3];   // 红方战队1名称
                const redTeam2Name = parts[5];   // 红方战队2名称
                const blueTeam1Name = parts[7];  // 蓝方战队1名称
                const blueTeam2Name = parts[9];  // 蓝方战队2名称
                
                const redWinLossScore = parseInt(parts[10]) || 0;  // 红方胜负分
                const redTotalScore = parseInt(parts[11]) || 0;     // 红方总分
                const redNetScore = parseInt(parts[12]) || 0;       // 红方净胜分
                const blueWinLossScore = parseInt(parts[13]) || 0;  // 蓝方胜负分
                const blueTotalScore = parseInt(parts[14]) || 0;    // 蓝方总分
                const blueNetScore = parseInt(parts[15]) || 0;      // 蓝方净胜分
                
                // 累计红方战队1数据
                if (redTeam1Name) {
                    if (!teamMap.has(redTeam1Name)) {
                        teamMap.set(redTeam1Name, {
                            team: redTeam1Name,
                            wins: 0,
                            losses: 0,
                            points: 0,
                            totalScore: 0,
                            netScore: 0,
                            matches: 0
                        });
                    }
                    const team = teamMap.get(redTeam1Name);
                    team.points += redWinLossScore;
                    team.totalScore += redTotalScore;
                    team.netScore += redNetScore;
                    team.matches += 1;
                    if (redWinLossScore > blueWinLossScore) {
                        team.wins += 1;
                    } else if (redWinLossScore < blueWinLossScore) {
                        team.losses += 1;
                    }
                }
                
                // 累计红方战队2数据
                if (redTeam2Name) {
                    if (!teamMap.has(redTeam2Name)) {
                        teamMap.set(redTeam2Name, {
                            team: redTeam2Name,
                            wins: 0,
                            losses: 0,
                            points: 0,
                            totalScore: 0,
                            netScore: 0,
                            matches: 0
                        });
                    }
                    const team = teamMap.get(redTeam2Name);
                    team.points += redWinLossScore;
                    team.totalScore += redTotalScore;
                    team.netScore += redNetScore;
                    team.matches += 1;
                    if (redWinLossScore > blueWinLossScore) {
                        team.wins += 1;
                    } else if (redWinLossScore < blueWinLossScore) {
                        team.losses += 1;
                    }
                }
                
                // 累计蓝方战队1数据
                if (blueTeam1Name) {
                    if (!teamMap.has(blueTeam1Name)) {
                        teamMap.set(blueTeam1Name, {
                            team: blueTeam1Name,
                            wins: 0,
                            losses: 0,
                            points: 0,
                            totalScore: 0,
                            netScore: 0,
                            matches: 0
                        });
                    }
                    const team = teamMap.get(blueTeam1Name);
                    team.points += blueWinLossScore;
                    team.totalScore += blueTotalScore;
                    team.netScore += blueNetScore;
                    team.matches += 1;
                    if (blueWinLossScore > redWinLossScore) {
                        team.wins += 1;
                    } else if (blueWinLossScore < redWinLossScore) {
                        team.losses += 1;
                    }
                }
                
                // 累计蓝方战队2数据
                if (blueTeam2Name) {
                    if (!teamMap.has(blueTeam2Name)) {
                        teamMap.set(blueTeam2Name, {
                            team: blueTeam2Name,
                            wins: 0,
                            losses: 0,
                            points: 0,
                            totalScore: 0,
                            netScore: 0,
                            matches: 0
                        });
                    }
                    const team = teamMap.get(blueTeam2Name);
                    team.points += blueWinLossScore;
                    team.totalScore += blueTotalScore;
                    team.netScore += blueNetScore;
                    team.matches += 1;
                    if (blueWinLossScore > redWinLossScore) {
                        team.wins += 1;
                    } else if (blueWinLossScore < redWinLossScore) {
                        team.losses += 1;
                    }
                }
            }
        }

        // 转换为数组
        teamsData = Array.from(teamMap.values());

        if (teamsData.length > 0) {
            calculateAndDisplayRanking();
            updateLastUpdateTime();
            showNotification(`成功解析 ${teamsData.length} 支队伍数据，共 ${lines.length - 1} 场比赛`, 'success');
        } else {
            showNotification('未能解析任何数据，请检查格式', 'error');
        }
    } catch (error) {
        showNotification('数据解析错误: ' + error.message, 'error');
        console.error('解析错误:', error);
    }
}

// 处理CSV文件上传
function handleFileSelect() {
    const file = csvFileInput.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        parseCSVContent(content);
    };
    reader.readAsText(file, 'UTF-8');
}

// 上传CSV按钮处理
function handleCSVUpload() {
    if (!csvFileInput.files.length) {
        showNotification('请先选择CSV文件', 'error');
        return;
    }
    // 文件选择后会自动触发 handleFileSelect
}

// 解析CSV内容
function parseCSVContent(content) {
    try {
        const lines = content.split('\n').filter(line => line.trim());
        teamsData = [];
        
        // 跳过第一行（标题行）
        for (let i = 1; i < lines.length; i++) {
            const parts = lines[i].split(',').map(p => p.trim());
            
            if (parts.length >= 4) {
                teamsData.push({
                    team: parts[0],
                    wins: parseInt(parts[1]) || 0,
                    losses: parseInt(parts[2]) || 0,
                    points: parseInt(parts[3]) || 0
                });
            }
        }

        if (teamsData.length > 0) {
            calculateAndDisplayRanking();
            updateLastUpdateTime();
            showNotification(`成功导入 ${teamsData.length} 支队伍数据`, 'success');
        } else {
            showNotification('CSV文件中没有有效数据', 'error');
        }
    } catch (error) {
        showNotification('CSV解析错误: ' + error.message, 'error');
    }
}
