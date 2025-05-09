document.addEventListener('DOMContentLoaded', function() {
    const API_KEY = '5a8c1fa05a7c6c9d62b76192';
    const API_BASE_URL = 'https://v6.exchangerate-api.com/v6/' + API_KEY;
    const CACHE_DURATION = 30 * 60 * 1000;

    const amountInput = document.getElementById('amount');
    const fromCurrencySelect = document.getElementById('from-currency');
    const toCurrencySelect = document.getElementById('to-currency');
    const swapBtn = document.getElementById('swap-btn');
    const convertBtn = document.getElementById('convert-btn');
    const resultDiv = document.getElementById('result');
    const baseCurrencySelect = document.getElementById('base-currency');
    const targetCurrencySelect = document.getElementById('target-currency');
    const timePeriodSelect = document.getElementById('time-period');
    const chartCanvas = document.getElementById('currency-chart');
    const historyList = document.getElementById('history-list');
    const currencyCards = document.querySelectorAll('.currency-card');

    // State
    let exchangeRates = {};
    let currencies = [];
    let conversionHistory = JSON.parse(localStorage.getItem('conversionHistory')) || [];
    let currencyChart = null;

    // Loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    loadingIndicator.textContent = 'Loading...';

    async function init() {
        try {
            document.body.appendChild(loadingIndicator);
            await fetchExchangeRates();
            populateCurrencyDropdowns();
            loadConversionHistory();
            setupPopularCurrencies();
            await initChart();
            
            // Event listeners
            convertBtn.addEventListener('click', convertCurrency);
            swapBtn.addEventListener('click', swapCurrencies);
            baseCurrencySelect.addEventListener('change', updateChart);
            targetCurrencySelect.addEventListener('change', updateChart);
            timePeriodSelect.addEventListener('change', updateChart);
            
            // Popular currencies click handlers
            currencyCards.forEach(card => {
                card.addEventListener('click', () => {
                    const fromCurrency = card.dataset.from;
                    const toCurrency = card.dataset.to;
                    
                    fromCurrencySelect.value = fromCurrency;
                    toCurrencySelect.value = toCurrency;
                    updateFlags();
                    
                    // Focus on amount input
                    amountInput.focus();
                });
            });
        } catch (error) {
            console.error('Initialization error:', error);
            showError('Failed to load data. Please refresh the page.');
        } finally {
            loadingIndicator.remove();
        }
    }

    async function fetchExchangeRates() {
        const cacheKey = 'exchangeRates_' + API_KEY;
        const cachedData = getFromCache(cacheKey);
        
        if (cachedData) {
            exchangeRates = cachedData.rates;
            currencies = Object.keys(cachedData.rates).sort();
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/latest/USD`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            if (data.result !== 'success') throw new Error(data['error-type']);
            
            exchangeRates = data.conversion_rates;
            currencies = Object.keys(data.conversion_rates).sort();
            saveToCache(cacheKey, { rates: exchangeRates }, CACHE_DURATION);
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            throw error;
        }
    }

    function populateCurrencyDropdowns() {
        const selects = [fromCurrencySelect, toCurrencySelect, baseCurrencySelect, targetCurrencySelect];
        
        selects.forEach(select => {
            select.innerHTML = '';
            currencies.forEach(currency => {
                const option = document.createElement('option');
                option.value = currency;
                option.textContent = currency;
                select.appendChild(option);
            });
        });

        // Set default currencies
        const defaultPairs = { from: 'USD', to: 'UAH' };
        if (currencies.includes(defaultPairs.from)) fromCurrencySelect.value = defaultPairs.from;
        if (currencies.includes(defaultPairs.to)) toCurrencySelect.value = defaultPairs.to;
        if (currencies.includes(defaultPairs.from)) baseCurrencySelect.value = defaultPairs.from;
        if (currencies.includes(defaultPairs.to)) targetCurrencySelect.value = defaultPairs.to;

        updateFlags();
    }

    function updateFlags() {
        const flagMap = {
            'from-currency': 'from-flag',
            'to-currency': 'to-flag',
            'base-currency': 'base-flag',
            'target-currency': 'target-flag'
        };

        Object.entries(flagMap).forEach(([selectId, flagId]) => {
            const select = document.getElementById(selectId);
            const flag = document.getElementById(flagId);
            if (select && flag) {
                flag.src = getFlagUrl(select.value);
            }
        });
    }

    function getFlagUrl(currencyCode) {
        const specialCases = {
            EUR: 'eu',
            XAU: 'un',
            XAG: 'un',
            BTC: 'un',
            ETH: 'un'
        };

        if (specialCases[currencyCode]) {
            return `https://flagcdn.com/24x18/${specialCases[currencyCode]}.png`;
        }
        
        const countryCode = currencyCode.slice(0, 2).toLowerCase();
        return `https://flagcdn.com/24x18/${countryCode}.png`;
    }

    function setupPopularCurrencies() {
        if (!exchangeRates || Object.keys(exchangeRates).length === 0) return;

        currencyCards.forEach(card => {
            const fromCurrency = card.dataset.from;
            const toCurrency = card.dataset.to;
            
            if (exchangeRates[fromCurrency] && exchangeRates[toCurrency]) {
                const rate = (exchangeRates[toCurrency] / exchangeRates[fromCurrency]).toFixed(6);
                
                // Special case for JPY (typically shown as 100 JPY)
                if (fromCurrency === 'JPY') {
                    card.querySelector('.currency-rate').textContent = `100 ${fromCurrency} = ${(rate * 100).toFixed(4)} ${toCurrency}`;
                } else {
                    card.querySelector('.currency-rate').textContent = `1 ${fromCurrency} = ${rate} ${toCurrency}`;
                }
            }
        });
    }

    async function convertCurrency() {
        const amount = parseFloat(amountInput.value);
        if (isNaN(amount)) {
            showError('Please enter a valid amount');
            return;
        }
        if (amount <= 0) {
            showError('Please enter a positive amount');
            return;
        }

        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;

        try {
            document.body.appendChild(loadingIndicator);
            await fetchExchangeRates();

            if (!exchangeRates[fromCurrency] || !exchangeRates[toCurrency]) {
                throw new Error('Exchange rates not found for selected currencies');
            }

            const rate = exchangeRates[toCurrency] / exchangeRates[fromCurrency];
            const convertedAmount = (amount * rate).toFixed(2);
            
            resultDiv.innerHTML = `
                <div class="conversion-result">
                    <span class="amount">${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}</span>
                    <span class="rate">1 ${fromCurrency} = ${rate.toFixed(6)} ${toCurrency}</span>
                </div>
            `;

            addToHistory(amount, fromCurrency, convertedAmount, toCurrency);
        } catch (error) {
            console.error('Conversion error:', error);
            showError('Conversion failed. Please try again.');
        } finally {
            loadingIndicator.remove();
        }
    }

    function addToHistory(amount, fromCurrency, convertedAmount, toCurrency) {
        const conversion = {
            id: Date.now(),
            amount,
            fromCurrency,
            convertedAmount,
            toCurrency,
            date: new Date().toLocaleString(),
            rate: (exchangeRates[toCurrency]/exchangeRates[fromCurrency]).toFixed(6)
        };
        
        conversionHistory.unshift(conversion);
        if (conversionHistory.length > 10) conversionHistory.pop();
        localStorage.setItem('conversionHistory', JSON.stringify(conversionHistory));
        loadConversionHistory();
    }

    function loadConversionHistory() {
        historyList.innerHTML = conversionHistory.length ? 
            conversionHistory.map(item => `
                <div class="history-item">
                    <div class="history-amount">
                        ${item.amount} ${item.fromCurrency} → ${item.convertedAmount} ${item.toCurrency}
                        <small>(${item.rate})</small>
                    </div>
                    <div class="history-date">${item.date}</div>
                </div>
            `).join('') : 
            '<p class="empty-history">No conversion history</p>';
    }

    async function initChart() {
        await updateChart();
    }

    async function updateChart() {
        const base = baseCurrencySelect.value;
        const target = targetCurrencySelect.value;
        const days = parseInt(timePeriodSelect.value);
        
        try {
            document.body.appendChild(loadingIndicator);
            const { labels, rates } = await fetchHistoricalData(base, target, days);
            
            if (!currencyChart) {
                const ctx = chartCanvas.getContext('2d');
                currencyChart = new Chart(ctx, {
                    type: 'line',
                    data: { labels, datasets: [{
                        label: `${base} to ${target}`,
                        data: rates,
                        borderColor: '#4271dc',
                        backgroundColor: 'rgba(66, 113, 220, 0.1)',
                        borderWidth: 2,
                        tension: 0.4,
                        fill: true
                    }]},
                    options: {
                        responsive: true,
                        plugins: {
                            title: { display: true, text: `Exchange rate dynamics (last ${days} days)` },
                            tooltip: {
                                callbacks: {
                                    label: (context) => `1 ${base} = ${context.raw} ${target}`
                                }
                            }
                        }
                    }
                });
            } else {
                currencyChart.data.labels = labels;
                currencyChart.data.datasets[0].data = rates;
                currencyChart.data.datasets[0].label = `${base} to ${target}`;
                currencyChart.options.plugins.title.text = `Exchange rate dynamics (last ${days} days)`;
                currencyChart.update();
            }
        } catch (error) {
            console.error('Chart update error:', error);
            showError('Failed to update chart');
        } finally {
            loadingIndicator.remove();
        }
    }

    async function fetchHistoricalData(base, target, days) {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - days);

        try {
            const response = await fetch(`https://api.exchangerate.host/timeseries?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&base=${base}&symbols=${target}`);
            const data = await response.json();
            
            const labels = Object.keys(data.rates);
            const rates = labels.map(date => data.rates[date][target]);
            
            return { labels, rates };
        } catch (error) {
            console.error('Error fetching historical data:', error);
            return generateTestData(days, base, target);
        }
    }

    function swapCurrencies() {
        [fromCurrencySelect.value, toCurrencySelect.value] = [toCurrencySelect.value, fromCurrencySelect.value];
        updateFlags();
        convertCurrency();
    }

    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    function generateTestData(days, base, target) {
        const baseRate = exchangeRates[base] || 1;
        const targetRate = exchangeRates[target] || 1;
        const initialRate = targetRate / baseRate;
        
        const labels = [];
        const rates = [];
        
        for (let i = days; i >= 0; i--) {
            labels.push(`${i} days ago`);
            rates.push((initialRate * (0.95 + Math.random() * 0.1)).toFixed(4));
        }
        
        return { labels, rates };
    }

    function showError(message) {
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.textContent = message;
        document.body.appendChild(errorEl);
        setTimeout(() => errorEl.remove(), 3000);
    }

    function getFromCache(key) {
        const cached = localStorage.getItem(key);
        if (!cached) return null;
        
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_DURATION) return null;
        
        return data;
    }

    function saveToCache(key, data, duration) {
        localStorage.setItem(key, JSON.stringify({
            data,
            timestamp: Date.now()
        }));
    }

    // Initialize currency change listeners
    ['from-currency', 'to-currency', 'base-currency', 'target-currency'].forEach(id => {
        const select = document.getElementById(id);
        if (select) {
            select.addEventListener('change', updateFlags);
        }
    });

    // Start the app
    init();
});