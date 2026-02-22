import { useState, useCallback, useRef } from 'react';
import type { TeamRaw, TeamRanked, SortField, SortOrder, DataSource, TabName } from './types';
import { sampleData } from './data/sampleData';
import { parseTableData, parseCSVData, parseCSVFileContent } from './utils/dataParser';
import { calculateRanking, sortTeams } from './utils/rankingAlgorithm';
import { fetchKDocsData } from './utils/kdocsFetcher';
import { useNotification } from './hooks/useNotification';
import { useFeaturedTeams } from './hooks/useFeaturedTeams';
import { useAutoRefresh } from './hooks/useAutoRefresh';

import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { TabNavigation } from './components/layout/TabNavigation';
import { DataControls } from './components/data-input/DataControls';
import { DataInputPanel } from './components/data-input/DataInputPanel';
import { StatsCards } from './components/ranking/StatsCards';
import { FeaturedTeams } from './components/ranking/FeaturedTeams';
import { SearchBox } from './components/ranking/SearchBox';
import { RankingTable } from './components/ranking/RankingTable';
import { PlayoffView } from './components/playoff/PlayoffView';
import { NotificationContainer } from './components/ui/Notification';

import styles from './App.module.css';

function formatTime(): string {
  return new Date().toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export default function App() {
  const [teamsData, setTeamsData] = useState<TeamRaw[]>([]);
  const [sortField, setSortField] = useState<SortField>('totalWinLossScore');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [dataSource, setDataSource] = useState<DataSource>('url');
  const [activeTab, setActiveTab] = useState<TabName>('ranking');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [lastUpdate, setLastUpdate] = useState('');
  const [kdocsUrl, setKDocsUrl] = useState('');
  const [isFetching, setIsFetching] = useState(false);

  const pasteAreaRef = useRef<HTMLTextAreaElement>(null);
  const { notifications, showNotification } = useNotification();
  const { featuredTeams, addTeam, removeTeam, toggleTeam } = useFeaturedTeams();

  const rankedTeams: TeamRanked[] = sortTeams(calculateRanking(teamsData), sortField, sortOrder);

  const updateTime = useCallback(() => setLastUpdate(formatTime()), []);

  const handleAutoRefresh = useCallback(async () => {
    // If URL mode, try fetching from URL
    if (kdocsUrl) {
      try {
        const result = await fetchKDocsData(kdocsUrl);
        if (result.success && result.teams.length > 0) {
          setTeamsData(result.teams);
          updateTime();
          return;
        }
      } catch {
        // Fall through to clipboard
      }
    }
    // Fallback to clipboard
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.length > 50) {
        const parsed = parseTableData(text);
        if (parsed.length > 0) {
          setTeamsData(parsed);
          updateTime();
        }
      }
    } catch {
      // Clipboard access may fail silently
    }
  }, [kdocsUrl, updateTime]);

  const autoRefresh = useAutoRefresh(handleAutoRefresh);

  const handleLoadSample = useCallback(() => {
    setTeamsData([...sampleData]);
    updateTime();
    showNotification('示例数据已加载', 'success');
  }, [updateTime, showNotification]);

  const handleLoadKDocs = useCallback(() => {
    setDataSource('kdocs');
  }, []);

  const handleQuickRead = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (!text) {
        showNotification('剪贴板为空', 'error');
        return;
      }
      if (pasteAreaRef.current) {
        pasteAreaRef.current.value = text;
      }
      const parsed = parseTableData(text);
      if (parsed.length > 0) {
        setTeamsData(parsed);
        updateTime();
        showNotification(`成功解析 ${parsed.length} 支队伍数据`, 'success');
      } else {
        showNotification('未能解析任何数据，请检查格式', 'error');
      }
    } catch {
      showNotification('无法读取剪贴板，请手动粘贴（需要浏览器权限）', 'error');
    }
  }, [updateTime, showNotification]);

  const handleRefresh = useCallback(() => {
    if (teamsData.length === 0) {
      showNotification('没有数据可刷新', 'error');
      return;
    }
    updateTime();
    showNotification('排名已刷新', 'success');
  }, [teamsData.length, updateTime, showNotification]);

  const handleFetchFromUrl = useCallback(async () => {
    if (!kdocsUrl.trim()) {
      showNotification('请输入金山文档链接', 'error');
      return;
    }
    setIsFetching(true);
    try {
      const result = await fetchKDocsData(kdocsUrl);
      if (result.success) {
        setTeamsData(result.teams);
        updateTime();
        showNotification(result.message, 'success');
      } else {
        showNotification(result.message, 'error');
      }
    } catch (err) {
      showNotification('获取数据失败: ' + (err as Error).message, 'error');
    } finally {
      setIsFetching(false);
    }
  }, [kdocsUrl, updateTime, showNotification]);

  const handleParseTable = useCallback(
    (text: string) => {
      if (!text.trim()) {
        showNotification('请先粘贴表格数据', 'error');
        return;
      }
      try {
        const parsed = parseTableData(text);
        if (parsed.length > 0) {
          setTeamsData(parsed);
          updateTime();
          showNotification(`成功解析 ${parsed.length} 支队伍数据`, 'success');
        } else {
          showNotification('未能解析任何数据，请检查格式', 'error');
        }
      } catch (error) {
        showNotification('数据解析错误: ' + (error as Error).message, 'error');
      }
    },
    [updateTime, showNotification],
  );

  const handleParseCSV = useCallback(
    (text: string) => {
      if (!text.trim()) {
        showNotification('请输入CSV数据', 'error');
        return;
      }
      try {
        const parsed = parseCSVData(text);
        if (parsed.length > 0) {
          setTeamsData(parsed);
          updateTime();
          showNotification(`成功解析 ${parsed.length} 支队伍数据`, 'success');
        } else {
          showNotification('未能解析任何数据，请检查格式', 'error');
        }
      } catch (error) {
        showNotification('数据解析错误: ' + (error as Error).message, 'error');
      }
    },
    [updateTime, showNotification],
  );

  const handleFileUpload = useCallback(
    (content: string) => {
      try {
        const parsed = parseCSVFileContent(content);
        if (parsed.length > 0) {
          setTeamsData(parsed);
          updateTime();
          showNotification(`成功导入 ${parsed.length} 支队伍数据`, 'success');
        } else {
          showNotification('CSV文件中没有有效数据', 'error');
        }
      } catch (error) {
        showNotification('CSV解析错误: ' + (error as Error).message, 'error');
      }
    },
    [updateTime, showNotification],
  );

  const handleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
      } else {
        setSortField(field);
        setSortOrder('desc');
      }
    },
    [sortField],
  );

  const handleAutoRefreshToggle = useCallback(
    (enabled: boolean) => {
      if (enabled && teamsData.length === 0) {
        showNotification('请先加载数据后再启用自动刷新', 'error');
        return;
      }
      autoRefresh.setEnabled(enabled);
      showNotification(
        enabled ? `自动刷新已启用（每${autoRefresh.interval}秒）` : '自动刷新已停止',
        enabled ? 'success' : 'info',
      );
    },
    [teamsData.length, autoRefresh, showNotification],
  );

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <Header />

        <DataControls
          dataSource={dataSource}
          onDataSourceChange={setDataSource}
          onLoadSample={handleLoadSample}
          onLoadKDocs={handleLoadKDocs}
          onQuickRead={handleQuickRead}
          onRefresh={handleRefresh}
          autoRefreshEnabled={autoRefresh.enabled}
          autoRefreshInterval={autoRefresh.interval}
          onAutoRefreshToggle={handleAutoRefreshToggle}
          onIntervalChange={autoRefresh.setInterval}
          kdocsUrl={kdocsUrl}
          onKDocsUrlChange={setKDocsUrl}
          onFetchFromUrl={handleFetchFromUrl}
          isFetching={isFetching}
        />

        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'ranking' && (
          <>
            <DataInputPanel
              dataSource={dataSource}
              onParseTable={handleParseTable}
              onParseCSV={handleParseCSV}
              onFileUpload={handleFileUpload}
              pasteAreaRef={pasteAreaRef}
            />

            <StatsCards teams={rankedTeams} />

            <FeaturedTeams
              teams={rankedTeams}
              featuredNames={featuredTeams}
              onAdd={addTeam}
              onRemove={removeTeam}
              allTeamNames={teamsData.map((t) => t.team)}
            />

            <SearchBox onSearch={setSearchKeyword} />

            <RankingTable
              teams={rankedTeams}
              sortField={sortField}
              sortOrder={sortOrder}
              onSort={handleSort}
              searchKeyword={searchKeyword}
              featuredNames={featuredTeams}
              onTeamClick={toggleTeam}
            />
          </>
        )}

        {activeTab === 'playoff' && (
          <PlayoffView teamsData={teamsData} showNotification={showNotification} />
        )}

        <Footer lastUpdate={lastUpdate} />
      </div>

      <NotificationContainer notifications={notifications} />
    </div>
  );
}
