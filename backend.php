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
 * Process incoming request
 */
function processRequest() {
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
    
    // No valid parameter found
    sendJsonResponse(['error' => 'Invalid request. Use ?figura=<meshID> or ?shadows'], 400);
}

// Process the request
processRequest();
?>