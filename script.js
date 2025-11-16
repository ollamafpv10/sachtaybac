// Application state
// Các cột động cho các lần đặt hàng
let lanColumns = ['lan1', 'lan2'];

// Các lựa chọn cho cột mảng
const mangOptions = [
    'Giáo khoa',
    'Tham khảo',
    'Tiểu thuyết',
    'Khoa học',
    'Lịch sử',
    'Văn học',
    'Ngoại ngữ',
    'Công nghệ',
    'Kinh tế',
    'Sách thiếu nhi'
];

let books = [
    { 
        id: 1, 
        stt: 1, 
        tenSach: '', 
        giaMoi: '', 
        mang: '', 
        tanKho: '', 
        lan1: '', 
        lan2: '', 
        traLai: '', 
        ghiChu: '' 
    }
];

// Filter state
let filteredBooks = [...books];
let searchTerm = '';
let minPrice = null;
let maxPrice = null;

// DOM elements
const tbody = document.getElementById('books-tbody');
const thead = document.getElementById('table-header');
const addRowBtn = document.getElementById('add-row-btn');
const loadDataBtn = document.getElementById('load-data-btn');
const exportExcelBtn = document.getElementById('export-excel-btn');
const addLanBtn = document.getElementById('add-lan-btn');
const totalRowsSpan = document.getElementById('total-rows');
const totalAmountSpan = document.getElementById('total-amount');

// Search and filter elements
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search-btn');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');
const clearFilterBtn = document.getElementById('clear-filter-btn');
const filterResultsText = document.getElementById('filter-results-text');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lucide icons
    lucide.createIcons();
    
    // Tải dữ liệu từ server khi khởi động
    loadDataFromServer();
    
    // Add event listeners
    addRowBtn.addEventListener('click', addRow);
    loadDataBtn.addEventListener('click', loadDataFromServer);
    exportExcelBtn.addEventListener('click', exportToExcel);
    addLanBtn.addEventListener('click', addLanColumn);
    
    // Search and filter event listeners
    searchInput.addEventListener('input', handleSearch);
    clearSearchBtn.addEventListener('click', clearSearch);
    minPriceInput.addEventListener('input', handlePriceFilter);
    maxPriceInput.addEventListener('input', handlePriceFilter);
    clearFilterBtn.addEventListener('click', clearAllFilters);
    
    // Render initial table
    renderTable();
});

// Calculate "Tổng đặt mới" (Total New Orders)
function calculateTongDatMoi(book) {
    // Tính tổng tất cả các cột lần
    let lanTotal = 0;
    lanColumns.forEach(col => {
        lanTotal += parseFloat(book[col]) || 0;
    });
    return lanTotal;
}

// Calculate "Tổng phải đặt" (Total Must Order)
function calculateTongPhaiDat(book) {
    // Tính tổng tất cả các cột lần
    let lanTotal = 0;
    lanColumns.forEach(col => {
        lanTotal += parseFloat(book[col]) || 0;
    });
    const tanKho = parseFloat(book.tanKho) || 0;
    const traLai = parseFloat(book.traLai) || 0;
    return lanTotal - tanKho - traLai;
}

// Search and filter functions
function handleSearch() {
    searchTerm = searchInput.value.toLowerCase().trim();
    applyFilters();
}

function handlePriceFilter() {
    minPrice = minPriceInput.value ? parseFloat(minPriceInput.value) : null;
    maxPrice = maxPriceInput.value ? parseFloat(maxPriceInput.value) : null;
    applyFilters();
}

function applyFilters() {
    filteredBooks = books.filter(book => {
        // Search by book name
        const matchesSearch = !searchTerm || 
            book.tenSach.toLowerCase().includes(searchTerm);
        
        // Filter by price range
        let matchesPrice = true;
        if (minPrice !== null || maxPrice !== null) {
            const price = parseFloat(book.giaMoi) || 0;
            if (minPrice !== null && price < minPrice) {
                matchesPrice = false;
            }
            if (maxPrice !== null && price > maxPrice) {
                matchesPrice = false;
            }
        }
        
        return matchesSearch && matchesPrice;
    });
    
    renderTable();
    updateFilterResultsText();
}

function clearSearch() {
    searchInput.value = '';
    searchTerm = '';
    applyFilters();
}

function clearAllFilters() {
    searchInput.value = '';
    minPriceInput.value = '';
    maxPriceInput.value = '';
    searchTerm = '';
    minPrice = null;
    maxPrice = null;
    filteredBooks = [...books];
    renderTable();
    updateFilterResultsText();
}

function updateFilterResultsText() {
    const total = books.length;
    const filtered = filteredBooks.length;
    
    if (filtered === total) {
        filterResultsText.textContent = `Hiển thị tất cả ${total} cuốn sách`;
    } else {
        filterResultsText.textContent = `Hiển thị ${filtered} / ${total} cuốn sách`;
    }
}

// Add a new row
function addRow() {
    // Find the maximum existing ID to avoid conflicts
    const maxId = books.length > 0 ? Math.max(...books.map(book => book.id)) : 0;
    const newId = maxId + 1;
    const newBook = {
        id: newId,
        stt: newId,
        tenSach: '',
        giaMoi: '',
        mang: '',
        tanKho: '',
        traLai: '',
        ghiChu: ''
    };
    // Thêm các cột lần động
    lanColumns.forEach(col => {
        newBook[col] = '';
    });
    books.push(newBook);
    applyFilters(); // Apply current filters to include new row
}

// Delete a row
function deleteRow(id) {
    if (books.length > 1) {
        if (confirm('Bạn có chắc muốn xóa dòng này? Dữ liệu sẽ bị xóa vĩnh viễn khỏi JSON.')) {
            books = books.filter(book => book.id !== id);
            
            // Lưu dữ liệu vào server sau khi xóa
            const dataToSave = {
                books: books,
                lanColumns: lanColumns
            };
            
            fetch('/api/data/row', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSave)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Dòng đã được xóa khỏi JSON:', data.message);
                    applyFilters(); // Reapply filters after deletion
                } else {
                    alert('Lỗi: ' + (data.error || 'Không thể xóa dữ liệu'));
                    // Reload data to restore state if save failed
                    loadDataFromServer();
                }
            })
            .catch(error => {
                console.error('Lỗi:', error);
                alert('Lỗi kết nối server!');
                // Reload data to restore state if save failed
                loadDataFromServer();
            });
        }
    } else {
        alert('Không thể xóa dòng cuối cùng!');
    }
}

// Update a field value
function updateField(id, field, value) {
    books = books.map(book => 
        book.id === id ? { ...book, [field]: value } : book
    );
    
    // Nếu là cột mảng và chọn "Khác", render lại bảng để hiện input tùy chỉnh
    if (field === 'mang' && value === 'custom') {
        renderTable();
        return;
    }
    
    // Reapply filters to update the displayed data
    applyFilters();
    updateCalculatedFields();
    updateSummary();
}

// Update calculated fields for all rows
function updateCalculatedFields() {
    filteredBooks.forEach(book => {
        const tongDatMoiElement = document.getElementById(`tongDatMoi-${book.id}`);
        const tongPhaiDatElement = document.getElementById(`tongPhaiDat-${book.id}`);
        
        if (tongDatMoiElement) {
            tongDatMoiElement.textContent = calculateTongDatMoi(book);
        }
        if (tongPhaiDatElement) {
            tongPhaiDatElement.textContent = calculateTongPhaiDat(book);
        }
    });
}

// Update footer summary
function updateSummary() {
    // Show total counts for both filtered and all books
    const totalBooks = books.length;
    const displayedBooks = filteredBooks.length;
    
    if (displayedBooks === totalBooks) {
        totalRowsSpan.textContent = totalBooks;
    } else {
        totalRowsSpan.textContent = `${displayedBooks} / ${totalBooks}`;
    }
    
    const totalAmount = filteredBooks.reduce((sum, book) => sum + calculateTongPhaiDat(book), 0);
    totalAmountSpan.textContent = totalAmount;
}

// Create table header HTML
function createTableHeader() {
    let lanHeaders = '';
    lanColumns.forEach((col, idx) => {
        lanHeaders += `
            <th>
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <span>Lần ${idx + 1}</span>
                    <button onclick="deleteLanColumn('${col}')" class="delete-column-btn" title="Xóa cột">
                        <i data-lucide="x" style="width: 12px; height: 12px;"></i>
                    </button>
                </div>
            </th>
        `;
    });
    
    return `
        <tr class="table-header">
            <th class="sticky-left">STT</th>
            <th>TÊN SÁCH</th>
            <th>GIÁ MỚI</th>
            <th>MẢNG</th>
            <th>Tồn kho</th>
            <th class="calculated-column">Tổng đặt mới</th>
            ${lanHeaders}
            <th>Trả lại, huỷ đơn hàng</th>
            <th class="calculated-column-green">Tổng phải đặt</th>
            <th>Ghi chú</th>
            <th class="save-column">Lưu</th>
            <th class="sticky-right">Xóa</th>
        </tr>
    `;
}

// Create table row HTML
function createTableRow(book, index) {
    const rowClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
    const baseTabIndex = (index * 20) + 1; // Give each row a range of 20 tab indices
    let tabIndex = baseTabIndex;
    
    let lanInputs = '';
    lanColumns.forEach(col => {
        lanInputs += `
            <td>
                <input 
                    type="number" 
                    value="${book[col] || ''}" 
                    onchange="updateField(${book.id}, '${col}', this.value)"
                    placeholder="0"
                    class="form-input"
                    tabindex="${tabIndex + 5 + lanColumns.indexOf(col)}"
                />
            </td>
        `;
    });
    
    return `
        <tr class="${rowClass}">
            <td class="sticky-left">
                <input 
                    type="number" 
                    value="${book.stt}" 
                    onchange="updateField(${book.id}, 'stt', this.value)"
                    class="form-input"
                    tabindex="${tabIndex}"
                />
            </td>
            <td>
                <input 
                    type="text" 
                    value="${book.tenSach}" 
                    onchange="updateField(${book.id}, 'tenSach', this.value)"
                    placeholder="Nhập tên sách..."
                    class="form-input"
                    tabindex="${tabIndex + 1}"
                />
            </td>
            <td>
                <input 
                    type="text" 
                    value="${book.giaMoi}" 
                    onchange="updateField(${book.id}, 'giaMoi', this.value)"
                    placeholder="0"
                    class="form-input"
                    tabindex="${tabIndex + 2}"
                />
            </td>
            <td>
                <select 
                    onchange="handleMangChange(${book.id}, this.value)"
                    class="form-input"
                    tabindex="${tabIndex + 3}"
                >
                    <option value="">Đại loại...</option>
                    ${mangOptions.map(option => 
                        `<option value="${option}" ${book.mang === option ? 'selected' : ''}>${option}</option>`
                    ).join('')}
                    <option value="custom" ${!mangOptions.includes(book.mang) && book.mang && book.mang !== '' ? 'selected' : ''}>Khác...</option>
                </select>
                ${!mangOptions.includes(book.mang) && book.mang && book.mang !== '' && book.mang !== 'custom' ? 
                    `<input 
                        type="text" 
                        value="${book.mang}" 
                        onchange="updateField(${book.id}, 'mang', this.value)"
                        placeholder="Nhập đại loại..."
                        class="form-input" 
                        style="margin-top: 0.25rem;"
                        tabindex="${tabIndex + 3}"
                    />` : 
                    (book.mang === 'custom' ? 
                    `<input 
                        type="text" 
                        value="" 
                        onchange="updateField(${book.id}, 'mang', this.value)"
                        placeholder="Nhập đại loại..."
                        class="form-input" 
                        style="margin-top: 0.25rem;"
                        tabindex="${tabIndex + 3}"
                        autofocus
                    />` : '')}
            </td>
            <td>
                <input 
                    type="number" 
                    value="${book.tanKho}" 
                    onchange="updateField(${book.id}, 'tanKho', this.value)"
                    placeholder="0"
                    class="form-input"
                    tabindex="${tabIndex + 4}"
                />
            </td>
            <td style="background-color: #fffbeb;">
                <div id="tongDatMoi-${book.id}" class="calculated-field">
                    ${calculateTongDatMoi(book)}
                </div>
            </td>
            ${lanInputs}
            <td>
                <input 
                    type="number" 
                    value="${book.traLai}" 
                    onchange="updateField(${book.id}, 'traLai', this.value)"
                    placeholder="0"
                    class="form-input"
                    tabindex="${tabIndex + 5 + lanColumns.length}"
                />
            </td>
            <td style="background-color: #f0fdf4;">
                <div id="tongPhaiDat-${book.id}" class="calculated-field-green">
                    ${calculateTongPhaiDat(book)}
                </div>
            </td>
            <td>
                <input 
                    type="text" 
                    value="${book.ghiChu}" 
                    onchange="updateField(${book.id}, 'ghiChu', this.value)"
                    placeholder="Ghi chú..."
                    class="form-input"
                    tabindex="${tabIndex + 6 + lanColumns.length}"
                />
            </td>
            <td class="save-column" style="text-align: center;">
                <button 
                    onclick="saveRowToJson(${book.id})"
                    class="save-row-btn"
                    title="Lưu dòng này vào data.json"
                    tabindex="${tabIndex + 7 + lanColumns.length}"
                >
                    <i data-lucide="save"></i>
                </button>
            </td>
            <td class="sticky-right" style="text-align: center;">
                <button 
                    onclick="deleteRow(${book.id})"
                    ${books.length === 1 ? 'disabled' : ''}
                    class="delete-btn"
                    title="Xóa dòng"
                    tabindex="${tabIndex + 8 + lanColumns.length}"
                >
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        </tr>
    `;
}

// Render the entire table
function renderTable() {
    thead.innerHTML = createTableHeader();
    tbody.innerHTML = filteredBooks.map((book, index) => createTableRow(book, index)).join('');
    
    // Re-initialize Lucide icons for newly added elements
    lucide.createIcons();
    
    updateSummary();
    updateCalculatedFields();
    updateFilterResultsText();
}

// Export data to Excel
function exportToExcel() {
    const headers = ['STT', 'TÊN SÁCH', 'GIÁ MỚI', 'MẢNG', 'Tồn kho', 'Tổng đặt mới'];
    
    lanColumns.forEach((col, idx) => {
        headers.push('Lần ' + (idx + 1));
    });
    
    headers.push('Trả lại, huỷ đơn hàng', 'Tổng phải đặt', 'Ghi chú');
    
    // Use filtered books for export
    const rows = filteredBooks.map(book => {
        let row = [
            book.stt,
            book.tenSach,
            book.giaMoi,
            book.mang,
            book.tanKho,
            calculateTongDatMoi(book)
        ];
        
        lanColumns.forEach(col => {
            row.push(book[col] || '');
        });
        
        row.push(
            book.traLai,
            calculateTongPhaiDat(book),
            book.ghiChu
        );
        
        return row;
    });
    
    // Tạo workbook và worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    
    // Đặt độ rộng cột
    const colWidths = [
        {wch: 5},   // STT
        {wch: 30},  // TÊN SÁCH
        {wch: 12},  // GIÁ MỚI
        {wch: 15},  // MẢNG
        {wch: 10},  // Tồn kho
        {wch: 12}   // Tổng đặt mới
    ];
    
    // Thêm độ rộng cho các cột lần
    lanColumns.forEach(() => {
        colWidths.push({wch: 8});
    });
    
    colWidths.push(
        {wch: 20}, // Trả lại
        {wch: 12}, // Tổng phải đặt
        {wch: 20}  // Ghi chú
    );
    
    ws['!cols'] = colWidths;
    
    // Thêm worksheet vào workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Quản lý sách');
    
    // Tạo tên file
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const fileName = 'quan-ly-sach-' + yyyy + '-' + mm + '-' + dd + '.xlsx';
    
    // Xuất file
    XLSX.writeFile(wb, fileName);
}

// Xử lý thay đổi dropdown mảng
function handleMangChange(id, value) {
    if (value === 'custom') {
        updateField(id, 'mang', 'custom');
    } else {
        updateField(id, 'mang', value);
    }
}

// Lưu dữ liệu dòng vào data.json thông qua server
function saveRowToJson(bookId) {
    const book = books.find(b => b.id === bookId);
    if (!book) {
        alert('Không tìm thấy dòng!');
        return;
    }
    
    // Tạo dữ liệu để lưu
    const dataToSave = {
        books: books,
        lanColumns: lanColumns
    };
    
    // Gửi đến server
    fetch('/api/data/row', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSave)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
        } else {
            alert('Lỗi: ' + (data.error || 'Không thể lưu dữ liệu'));
        }
    })
    .catch(error => {
        console.error('Lỗi:', error);
        alert('Lỗi kết nối server!');
    });
}

// Tải dữ liệu từ server
function loadDataFromServer() {
    fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        if (data.books && Array.isArray(data.books)) {
            books = data.books;
        }
        
        if (data.lanColumns && Array.isArray(data.lanColumns)) {
            lanColumns = data.lanColumns;
        }
        
        // Reset filters and apply them
        filteredBooks = [...books];
        applyFilters();
        console.log('Dữ liệu đã được tải từ data.json');
    })
    .catch(error => {
        console.error('Lỗi tải dữ liệu:', error);
        // Nếu lỗi, sử dụng dữ liệu mặc định
        filteredBooks = [...books];
        renderTable();
    });
}

// Xóa cột lần với xác thực mật khẩu
function deleteLanColumn(colName) {
    // Mật khẩu cố định
    const PASSWORD = "admin123";
    
    const password = prompt("Nhập mật khẩu để xóa cột:");
    
    if (password !== PASSWORD) {
        alert("Mật khẩu không đúng!");
        return;
    }
    
    if (lanColumns.length <= 1) {
        alert("Không thể xóa cột cuối cùng!");
        return;
    }
    
    if (confirm(`Bạn có chắc muốn xóa cột "${colName}"?`)) {
        // Xóa cột khỏi danh sách
        lanColumns = lanColumns.filter(col => col !== colName);
        
        // Xóa thuộc tính khỏi tất cả sách
        books = books.map(book => {
            const { [colName]: removed, ...rest } = book;
            return rest;
        });
        
        applyFilters(); // Reapply filters after column deletion
    }
}

// Thêm cột lần mới
function addLanColumn() {
    // Tìm số thứ tự lớn nhất hiện tại
    let maxLan = 0;
    lanColumns.forEach(col => {
        const num = parseInt(col.replace('lan', ''));
        if (!isNaN(num) && num > maxLan) maxLan = num;
    });
    const newLan = 'lan' + (maxLan + 1);
    lanColumns.push(newLan);
    
    // Thêm thuộc tính cho từng book
    books = books.map(book => ({ ...book, [newLan]: '' }));
    applyFilters(); // Reapply filters after adding new column
}

// Make functions available globally
window.addRow = addRow;
window.deleteRow = deleteRow;
window.updateField = updateField;
window.handleMangChange = handleMangChange;
window.addLanColumn = addLanColumn;
window.deleteLanColumn = deleteLanColumn;
window.saveRowToJson = saveRowToJson;
window.loadDataFromServer = loadDataFromServer;
window.clearSearch = clearSearch;
window.clearAllFilters = clearAllFilters;