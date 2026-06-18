<?php
ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);
/**
 * Backend API for Figura and Shadow data
 * 
 * Endpoints:
 * - GET /backend.php?figura=<meshID> - Returns alzada, planta, perfil for a figura
 * - GET /backend.php?shadows - Returns all shadows (ombra records)
 * - GET /backend.php?figuresForClasse=<idClasse> - Returns figures for a classe
 */

// Database configuration
define('DB_HOST', '127.0.0.1');
define('DB_PORT', 3306);
define('DB_USER', 'root');
define('DB_PASSWORD', 'root');
define('DB_NAME', 'FIGURES');

/**
 * Get database connection
 * @return mysqli|null Database connection or null on failure
 */
function getDbConnection() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT);
    
    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        return null;
    }
    
    $conn->set_charset("utf8mb4");
    return $conn;
}

/**
 * Get figura data by meshID
 * Returns alzada, planta, perfil values
 * 
 * @param string $meshID The meshID to search for
 * @return array|null Figura data or null if not found
 */
function getFiguraByMeshID($meshID) {
    $conn = getDbConnection();
    
    if (!$conn) {
        return null;
    }
    
    $stmt = $conn->prepare("SELECT alzada, planta, perfil FROM FIGURA WHERE meshID = ?");
    $stmt->bind_param("s", $meshID);
    $stmt->execute();
    
    $result = $stmt->get_result();
    
    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $conn->close();
        return $row;
    }
    
    $conn->close();
    return null;
}

/**
 * Get all figures by classe ID
 * Returns array of figure records
 * 
 * @param int $idClasse The classe ID to search for
 * @return array Array of figure records
 */
function getFiguresByClasseID($idClasse) {
    $conn = getDbConnection();
    
    if (!$conn) {
        return [];
    }
    
    $stmt = $conn->prepare("SELECT f.id, f.meshID, f.nom, f.descript, f.alzada, f.planta, f.perfil FROM FIGURA f INNER JOIN R_CLASSE_FIGURA rc ON f.id = rc.idFigura WHERE rc.idClasse = ?");
    $stmt->bind_param("i", $idClasse);
    $stmt->execute();
    
    $result = $stmt->get_result();
    $figures = [];
    
    if ($result && $result->num_rows > 0) {
        $index = 0;
        while ($row = $result->fetch_assoc()) {
            $figures[$index] = [
                'id' => $row['id'],
                'meshID' => $row['meshID'],
                'nom' => $row['nom'],
                'descript' => $row['descript'],
                'alzada' => (int)$row['alzada'],
                'planta' => (int)$row['planta'],
                'perfil' => (int)$row['perfil']
            ];
            $index++;
        }
    }
    
    $conn->close();
    return $figures;
}

/**
 * Get all shadows (ombra records)
 * Returns array of shadow records
 * 
 * @return array Array of shadow records with meshID and imgID
 */
function getAllShadows() {
    $conn = getDbConnection();
    
    if (!$conn) {
        return [];
    }
    
    $stmt = $conn->prepare("SELECT meshID, imgID FROM OMBRA");
    $stmt->execute();
    
    $result = $stmt->get_result();
    $shadows = [];
    
    if ($result && $result->num_rows > 0) {
        $index = 0;
        while ($row = $result->fetch_assoc()) {
            $shadows[$index] = [
                'meshID' => $row['meshID'],
                'imgID' => $row['imgID']
            ];
            $index++;
        }
    }
    
    $conn->close();
    return $shadows;
}

/**
 * Set JSON response headers and output
 * 
 * @param array $data Data to output as JSON
 * @param int $statusCode HTTP status code
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}

/**
 * Save log to file
 * @param string $filename Filename
 * @param string $content File content
 * @return array Response with success/error status
 */
function saveLogToFile($filename, $content) {
    $logsDir = __DIR__ . '/logs';
    
    // Create logs directory if it doesn't exist
    if (!is_dir($logsDir)) {
        mkdir($logsDir, 0755, true);
    }
    
    $filepath = $logsDir . '/' . $filename;
    
    // Write content to file
    $result = file_put_contents($filepath, $content);
    
    if ($result !== false) {
        return [
            'success' => true,
            'filepath' => $filepath,
            'message' => 'Log saved successfully'
        ];
    }
    
    return [
        'success' => false,
        'message' => 'Failed to save log file'
    ];
}

/**
 * Process incoming request
 */
function processRequest() {
    // Handle POST requests for saving logs
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        if (isset($_SERVER['HTTP_CONTENT_TYPE']) && strpos($_SERVER['HTTP_CONTENT_TYPE'], 'application/json') !== false) {
            $rawInput = file_get_contents('php://input');
            $data = json_decode($rawInput, true);
            
            if (isset($data['action']) && $data['action'] === 'saveLog' && isset($data['filename']) && isset($data['content'])) {
                $response = saveLogToFile($data['filename'], $data['content']);
                sendJsonResponse($response, $response['success'] ? 200 : 500);
                return;
            }
        }
        
        sendJsonResponse(['error' => 'Invalid request. Use action=saveLog with filename and content.'], 400);
        return;
    }
    
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        sendJsonResponse(['error' => 'Method not allowed'], 405);
        return;
    }
    
    // Check for figura parameter
    if (isset($_GET['figura'])) {
        $meshID = $_GET['figura'];
        $figura = getFiguraByMeshID($meshID);
        
        if ($figura) {
            sendJsonResponse($figura);
        } else {
            sendJsonResponse(['error' => 'Figura not found'], 404);
        }
        return;
    }
    
    // Check for shadows parameter
    if (isset($_GET['shadows'])) {
        $shadows = getAllShadows();
        sendJsonResponse($shadows);
        return;
    }
    
    // Check for figuresForClasse parameter
    if (isset($_GET['figuresForClasse'])) {
        $idClasse = (int)$_GET['figuresForClasse'];
        $figures = getFiguresByClasseID($idClasse);
        sendJsonResponse($figures);
        return;
    }
    
    // No valid parameter found
    sendJsonResponse(['error' => 'Invalid request. Use ?figura=<meshID>, ?shadows, or ?figuresForClasse=<idClasse>'], 400);
}

// Process the request
processRequest();
?>