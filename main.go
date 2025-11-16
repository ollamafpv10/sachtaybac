package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

// Data structures
type Book struct {
	ID      int    `json:"id"`
	STT     int    `json:"stt"`
	TenSach string `json:"tenSach"`
	GiaMoi  string `json:"giaMoi"`
	Mang    string `json:"mang"`
	TanKho  string `json:"tanKho"`
	TraLai  string `json:"traLai"`
	GhiChu  string `json:"ghiChu"`
	// Sử dụng map để lưu các cột lần động
	LanData map[string]string `json:"-"` // Không serialize trực tiếp
}

// Custom JSON marshaling để hỗ trợ các cột lần động
type BookJSON struct {
	ID      int               `json:"id"`
	STT     int               `json:"stt"`
	TenSach string            `json:"tenSach"`
	GiaMoi  string            `json:"giaMoi"`
	Mang    string            `json:"mang"`
	TanKho  string            `json:"tanKho"`
	TraLai  string            `json:"traLai"`
	GhiChu  string            `json:"ghiChu"`
	LanData map[string]string `json:"-"`
}

// MarshalJSON implements custom JSON marshaling
func (b Book) MarshalJSON() ([]byte, error) {
	// Tạo một map để chứa tất cả data
	result := make(map[string]interface{})

	// Thêm các field cơ bản
	result["id"] = b.ID
	result["stt"] = b.STT
	result["tenSach"] = b.TenSach
	result["giaMoi"] = b.GiaMoi
	result["mang"] = b.Mang
	result["tanKho"] = b.TanKho
	result["traLai"] = b.TraLai
	result["ghiChu"] = b.GhiChu

	// Thêm các cột lần động
	for key, value := range b.LanData {
		result[key] = value
	}

	return json.Marshal(result)
}

// UnmarshalJSON implements custom JSON unmarshaling
func (b *Book) UnmarshalJSON(data []byte) error {
	// Parse JSON thành map trước
	var raw map[string]interface{}
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}

	// Đọc các field cơ bản
	if id, ok := raw["id"]; ok {
		if idFloat, ok := id.(float64); ok {
			b.ID = int(idFloat)
		}
	}
	if stt, ok := raw["stt"]; ok {
		if sttFloat, ok := stt.(float64); ok {
			b.STT = int(sttFloat)
		}
	}
	if tenSach, ok := raw["tenSach"].(string); ok {
		b.TenSach = tenSach
	}
	if giaMoi, ok := raw["giaMoi"].(string); ok {
		b.GiaMoi = giaMoi
	}
	if mang, ok := raw["mang"].(string); ok {
		b.Mang = mang
	}
	if tanKho, ok := raw["tanKho"].(string); ok {
		b.TanKho = tanKho
	}
	if traLai, ok := raw["traLai"].(string); ok {
		b.TraLai = traLai
	}
	if ghiChu, ok := raw["ghiChu"].(string); ok {
		b.GhiChu = ghiChu
	}

	// Khởi tạo LanData map
	b.LanData = make(map[string]string)

	// Đọc các cột lần động (bất kỳ field nào bắt đầu bằng "lan")
	for key, value := range raw {
		if len(key) >= 3 && key[:3] == "lan" {
			if strValue, ok := value.(string); ok {
				b.LanData[key] = strValue
			}
		}
	}

	return nil
}

type AppData struct {
	Books       []Book   `json:"books"`
	LanColumns  []string `json:"lanColumns"`
	LastUpdated string   `json:"lastUpdated"`
}

const dataDir = "./data"
const dataFile = "./data/data.json"
const port = ":3000"

// CORS middleware
func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

// Sync books with lanColumns để đảm bảo tất cả books có đủ các cột lan
func syncBooksWithLanColumns(data *AppData) {
	for i := range data.Books {
		// Đảm bảo LanData được khởi tạo
		if data.Books[i].LanData == nil {
			data.Books[i].LanData = make(map[string]string)
		}

		// Thêm các lan column thiếu vào LanData
		for _, lanCol := range data.LanColumns {
			if _, exists := data.Books[i].LanData[lanCol]; !exists {
				data.Books[i].LanData[lanCol] = ""
			}
		}

		// Xóa các lan column không còn trong LanColumns
		for key := range data.Books[i].LanData {
			found := false
			for _, lanCol := range data.LanColumns {
				if key == lanCol {
					found = true
					break
				}
			}
			if !found && len(key) >= 3 && key[:3] == "lan" {
				delete(data.Books[i].LanData, key)
			}
		}
	}
}

// Load data from JSON file
func loadData() (*AppData, error) {
	var data AppData

	// Ensure data directory exists
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create data directory: %v", err)
	}

	if _, err := os.Stat(dataFile); os.IsNotExist(err) {
		// Create default data if file doesn't exist
		data = AppData{
			Books: []Book{
				{
					ID:      1,
					STT:     1,
					TenSach: "",
					GiaMoi:  "",
					Mang:    "",
					TanKho:  "",
					TraLai:  "",
					GhiChu:  "",
					LanData: map[string]string{
						"lan1": "",
						"lan2": "",
					},
				},
			},
			LanColumns:  []string{"lan1", "lan2"},
			LastUpdated: time.Now().Format(time.RFC3339),
		}
		return &data, saveData(&data)
	}

	file, err := os.Open(dataFile)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	bytes, err := io.ReadAll(file)
	if err != nil {
		return nil, err
	}

	err = json.Unmarshal(bytes, &data)

	// Đảm bảo tất cả books có LanData được khởi tạo
	for i := range data.Books {
		if data.Books[i].LanData == nil {
			data.Books[i].LanData = make(map[string]string)
		}
	}

	// Đồng bộ books với lanColumns
	syncBooksWithLanColumns(&data)

	return &data, err
}

// Save data to JSON file
func saveData(data *AppData) error {
	data.LastUpdated = time.Now().Format(time.RFC3339)

	bytes, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(dataFile, bytes, 0644)
}

// API handlers
func getData(w http.ResponseWriter, r *http.Request) {
	data, err := loadData()
	if err != nil {
		http.Error(w, fmt.Sprintf("Lỗi đọc dữ liệu: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)
}

func saveDataHandler(w http.ResponseWriter, r *http.Request) {
	var data AppData
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		http.Error(w, fmt.Sprintf("Lỗi decode JSON: %v", err), http.StatusBadRequest)
		return
	}

	err = saveData(&data)
	if err != nil {
		http.Error(w, fmt.Sprintf("Lỗi lưu dữ liệu: %v", err), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Dữ liệu đã được lưu thành công!",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func saveRowHandler(w http.ResponseWriter, r *http.Request) {
	var newData AppData
	err := json.NewDecoder(r.Body).Decode(&newData)
	if err != nil {
		http.Error(w, fmt.Sprintf("Lỗi decode JSON: %v", err), http.StatusBadRequest)
		return
	}

	// Load current data and merge with new data
	currentData, err := loadData()
	if err != nil {
		currentData = &AppData{
			Books:      []Book{},
			LanColumns: []string{"lan1", "lan2"},
		}
	}

	if len(newData.Books) > 0 {
		currentData.Books = newData.Books
	}
	if len(newData.LanColumns) > 0 {
		currentData.LanColumns = newData.LanColumns
	}

	err = saveData(currentData)
	if err != nil {
		http.Error(w, fmt.Sprintf("Lỗi lưu dòng: %v", err), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"success": true,
		"message": "Dòng đã được lưu thành công!",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// Serve static files
func serveStaticFiles() {
	// Serve static files from current directory
	fs := http.FileServer(http.Dir("."))
	http.Handle("/static/", http.StripPrefix("/static/", fs))

	// Serve index.html for root path
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/" {
			http.ServeFile(w, r, "index.html")
			return
		}
		// For other paths, try to serve the file directly
		http.ServeFile(w, r, r.URL.Path[1:])
	})
}

func main() {
	// Setup routes
	http.HandleFunc("/api/data", func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case "GET":
			getData(w, r)
		case "POST":
			saveDataHandler(w, r)
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	http.HandleFunc("/api/data/row", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "POST" {
			saveRowHandler(w, r)
		} else {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Serve static files
	serveStaticFiles()

	// Apply CORS middleware to all routes
	handler := corsMiddleware(http.DefaultServeMux)

	// Start server
	fmt.Println()
	fmt.Println("✨ Ứng dụng Quản Lý Sách đang chạy! ✨")
	fmt.Println()
	fmt.Printf("🌐 Truy cập tại: http://localhost%s\n", port)
	fmt.Printf("💾 Dữ liệu lưu tại: %s\n", filepath.Join(".", dataFile))
	fmt.Println()
	fmt.Println("🚀 Mở trình duyệt và truy cập để sử dụng!")
	fmt.Println()
	fmt.Println("🛑 Ấn Ctrl+C để dừng server")
	fmt.Println()

	log.Fatal(http.ListenAndServe(port, handler))
}
