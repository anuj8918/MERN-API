import React, { useState, useEffect } from 'react';
import { Send, Plus, Trash2, Clock, Eye, Copy, Download, History } from 'lucide-react';

const PostmanClone = () => {
  const [request, setRequest] = useState({
    method: 'GET',
    url: '',
    headers: [{ key: '', value: '', enabled: true }],
    body: '',
    bodyType: 'raw'
  });
  
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('headers');
  const [responseTab, setResponseTab] = useState('body');

  const methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
  const bodyTypes = ['raw', 'form-data', 'urlencoded'];

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/history`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const sendRequest = async () => {
    if (!request.url.trim()) {
      alert('Please enter a URL');
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      // Prepare headers object
      const headers = {};
      request.headers.forEach(header => {
        if (header.key && header.value && header.enabled) {
          headers[header.key] = header.value;
        }
      });

      const requestData = {
        method: request.method,
        url: request.url,
        headers,
        body: request.body,
        bodyType: request.bodyType
      };

      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      const data = await res.json();
      setResponse(data.response);
      fetchHistory(); // Refresh history
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Network Error',
        data: error.message,
        time: 0,
        headers: {}
      });
    } finally {
      setLoading(false);
    }
  };

  const addHeader = () => {
    setRequest(prev => ({
      ...prev,
      headers: [...prev.headers, { key: '', value: '', enabled: true }]
    }));
  };

  const updateHeader = (index, field, value) => {
    const updatedHeaders = [...request.headers];
    updatedHeaders[index][field] = value;
    setRequest(prev => ({ ...prev, headers: updatedHeaders }));
  };

  const removeHeader = (index) => {
    const updatedHeaders = request.headers.filter((_, i) => i !== index);
    setRequest(prev => ({ ...prev, headers: updatedHeaders }));
  };

  const loadFromHistory = (historyItem) => {
    setRequest({
      method: historyItem.method,
      url: historyItem.url,
      headers: Object.entries(historyItem.headers || {}).map(([key, value]) => ({
        key, value, enabled: true
      })).concat([{ key: '', value: '', enabled: true }]),
      body: historyItem.body || '',
      bodyType: historyItem.bodyType || 'raw'
    });
    setResponse(historyItem.response);
    setShowHistory(false);
  };

  const copyResponse = () => {
    if (response?.data) {
      navigator.clipboard.writeText(response.data);
      alert('Response copied to clipboard!');
    }
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-emerald-600';
    if (status >= 300 && status < 400) return 'text-amber-600';
    if (status >= 400) return 'text-red-600';
    return 'text-slate-600';
  };

  const getStatusBgColor = (status) => {
    if (status >= 200 && status < 300) return 'bg-emerald-50 border-emerald-200';
    if (status >= 300 && status < 400) return 'bg-amber-50 border-amber-200';
    if (status >= 400) return 'bg-red-50 border-red-200';
    return 'bg-slate-50 border-slate-200';
  };

  const formatTime = (time) => {
    if (time < 1000) return `${time}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatJSON = (str) => {
    try {
      return JSON.stringify(JSON.parse(str), null, 2);
    } catch {
      return str;
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'POST': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PUT': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'PATCH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'DELETE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">API Studio</h1>
                <p className="text-sm text-slate-500">Professional API Testing Environment</p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                showHistory 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              Request History
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Professional History Sidebar */}
        {showHistory && (
          <div className="w-80 bg-white border-r border-slate-200 h-screen overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 text-lg">Request History</h3>
              <p className="text-sm text-slate-500 mt-1">Recent API requests</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.map((item) => (
                <div
                  key={item._id}
                  onClick={() => loadFromHistory(item)}
                  className="group p-4 border border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getMethodColor(item.method)}`}>
                      {item.method}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${getStatusColor(item.response?.status)}`}>
                        {item.response?.status}
                      </span>
                      <div className="w-2 h-2 rounded-full bg-slate-300 group-hover:bg-blue-400 transition-colors"></div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-900 font-medium truncate mb-2">{item.url}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Professional Request Builder */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Request Configuration</h2>
                <p className="text-sm text-slate-500 mt-1">Configure your API request parameters</p>
              </div>
            </div>
            
            {/* Professional URL Bar */}
            <div className="grid grid-cols-12 gap-4 mb-8 p-6 bg-slate-50 rounded-xl border border-slate-100">
              <div className="col-span-2">
                <select
                  value={request.method}
                  onChange={(e) => setRequest(prev => ({ ...prev, method: e.target.value }))}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  {methods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-8">
                <input
                  type="text"
                  value={request.url}
                  onChange={(e) => setRequest(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://api.example.com/endpoint"
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
                />
              </div>
              
              <div className="col-span-2">
                <button
                  onClick={sendRequest}
                  disabled={loading}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200 font-semibold text-sm shadow-sm"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  {loading ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>

            {/* Professional Tabs */}
            <div className="border-b border-slate-200 mb-6">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('headers')}
                  className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                    activeTab === 'headers' 
                      ? 'text-blue-600' 
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Headers
                  {activeTab === 'headers' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
                  )}
                </button>
                {['POST', 'PUT', 'PATCH'].includes(request.method) && (
                  <button
                    onClick={() => setActiveTab('body')}
                    className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                      activeTab === 'body' 
                        ? 'text-blue-600' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Request Body
                    {activeTab === 'body' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Professional Headers Tab */}
            {activeTab === 'headers' && (
              <div className="space-y-4">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-slate-600 px-1">
                  <div className="col-span-1"></div>
                  <div className="col-span-5">Header Name</div>
                  <div className="col-span-5">Header Value</div>
                  <div className="col-span-1"></div>
                </div>
                {request.headers.map((header, index) => (
                  <div key={index} className="grid grid-cols-12 gap-4 items-center group">
                    <div className="col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={header.enabled}
                        onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => updateHeader(index, 'key', e.target.value)}
                        placeholder="Content-Type"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="col-span-5">
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => updateHeader(index, 'value', e.target.value)}
                        placeholder="application/json"
                        className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => removeHeader(index)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addHeader}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mt-4 px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Header
                </button>
              </div>
            )}

            {/* Professional Body Tab */}
            {activeTab === 'body' && ['POST', 'PUT', 'PATCH'].includes(request.method) && (
              <div className="space-y-6">
                <div className="flex gap-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                  {bodyTypes.map(type => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="bodyType"
                        value={type}
                        checked={request.bodyType === type}
                        onChange={(e) => setRequest(prev => ({ ...prev, bodyType: e.target.value }))}
                        className="border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700 capitalize">{type}</span>
                    </label>
                  ))}
                </div>
                
                <textarea
                  value={request.body}
                  onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
                  placeholder={
                    request.bodyType === 'raw' 
                      ? '{\n  "name": "John Doe",\n  "email": "john@example.com"\n}' 
                      : 'Enter request body content...'
                  }
                  rows={12}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-slate-50"
                />
              </div>
            )}
          </div>

          {/* Professional Response Section */}
          {response && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Response</h2>
                  <p className="text-sm text-slate-500 mt-1">API response details</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">{formatTime(response.time)}</span>
                  </div>
                  <div className={`px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusBgColor(response.status)} ${getStatusColor(response.status)}`}>
                    {response.status} {response.statusText}
                  </div>
                  <button
                    onClick={copyResponse}
                    className="p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Professional Response Tabs */}
              <div className="border-b border-slate-200 mb-6">
                <div className="flex gap-8">
                  <button
                    onClick={() => setResponseTab('body')}
                    className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                      responseTab === 'body' 
                        ? 'text-blue-600' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Response Body
                    {responseTab === 'body' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setResponseTab('headers')}
                    className={`pb-3 px-1 font-medium text-sm transition-colors relative ${
                      responseTab === 'headers' 
                        ? 'text-blue-600' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Response Headers
                    {responseTab === 'headers' && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                </div>
              </div>

              {/* Professional Response Body */}
              {responseTab === 'body' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-700">Response Content</span>
                    <button
                      onClick={() => {
                        const formatted = formatJSON(response.data);
                        setResponse(prev => ({ ...prev, data: formatted }));
                      }}
                      className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                    >
                      Format JSON
                    </button>
                  </div>
                  <div className="bg-slate-900 rounded-xl p-6 border overflow-auto max-h-96">
                    <pre className="text-sm text-slate-100 font-mono leading-relaxed">
                      {response.data}
                    </pre>
                  </div>
                </div>
              )}

              {/* Professional Response Headers */}
              {responseTab === 'headers' && (
                <div className="space-y-4">
                  <span className="text-sm font-medium text-slate-700">Response Headers</span>
                  <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-3">
                    {Object.entries(response.headers || {}).map(([key, value]) => (
                      <div key={key} className="flex items-start py-2 border-b border-slate-200 last:border-b-0">
                        <span className="font-medium text-slate-900 w-48 text-sm shrink-0">{key}</span>
                        <span className="text-slate-600 text-sm font-mono break-all">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostmanClone;

