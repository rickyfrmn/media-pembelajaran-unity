import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ChevronsUp,
  Code2,
  Cuboid,
  Gamepad2,
  ListChecks,
  RotateCcw,
  Timer,
  Trash2,
  Trophy,
  Users
} from "lucide-react";

const STORAGE_KEY = "puzzleScriptScoreHistoryV3";

function makeQuestion(id, title, instruction, script, options, answer, action = "move") {
  return {
    id,
    title,
    instruction,
    blanks: answer.length,
    script,
    options,
    answer,
    action
  };
}

const unityLevel1 = [
  makeQuestion(1, "Gerak Maju Karakter", "Lengkapi script agar karakter bergerak maju.", ["using UnityEngine;", "", "public class MoveForward : MonoBehaviour {", "  public float speed = 5f;", "  void Update() {", "    ___BLANK_0___", "  }", "}"], ["transform.Translate(Vector3.forward * speed * Time.deltaTime);", "transform.Rotate(Vector3.up * 90f);", "Destroy(gameObject);", "Time.timeScale = 0;"], ["transform.Translate(Vector3.forward * speed * Time.deltaTime);"], "move"),
  makeQuestion(2, "Lompat Karakter", "Lengkapi script agar karakter melompat.", ["using UnityEngine;", "", "public class Jump : MonoBehaviour {", "  public Rigidbody rb;", "  public float jumpForce = 7f;", "  void Update() {", "    if (Input.GetKeyDown(KeyCode.Space)) {", "      ___BLANK_0___", "    }", "  }", "}"], ["rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);", "transform.Translate(Vector3.back);", "gameObject.SetActive(false);", "Debug.Log(speed);"], ["rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);"], "jump"),
  makeQuestion(3, "Rotasi Karakter", "Lengkapi script agar karakter berputar ke kanan.", ["using UnityEngine;", "", "public class RotatePlayer : MonoBehaviour {", "  void Update() {", "    ___BLANK_0___", "  }", "}"], ["transform.Rotate(Vector3.up * 90f);", "transform.position = Vector3.zero;", "Destroy(gameObject);", "Input.GetAxis(\"Vertical\");"], ["transform.Rotate(Vector3.up * 90f);"], "turn"),
  makeQuestion(4, "Debug Log", "Lengkapi script untuk menampilkan pesan di Console Unity.", ["using UnityEngine;", "", "public class DebugStart : MonoBehaviour {", "  void Start() {", "    ___BLANK_0___", "  }", "}"], ["Debug.Log(\"Game dimulai\");", "Time.deltaTime;", "Vector3.zero;", "SceneManager.LoadScene(0);"], ["Debug.Log(\"Game dimulai\");"], "message"),
  makeQuestion(5, "Reset Posisi", "Lengkapi script agar posisi karakter kembali ke titik nol.", ["using UnityEngine;", "", "public class ResetPosition : MonoBehaviour {", "  void Start() {", "    ___BLANK_0___", "  }", "}"], ["transform.position = Vector3.zero;", "transform.localScale = Vector3.one;", "rb.useGravity = true;", "Destroy(gameObject);"], ["transform.position = Vector3.zero;"], "move"),
  makeQuestion(6, "Input Tombol W", "Lengkapi kondisi agar tombol W dapat dibaca.", ["using UnityEngine;", "", "public class InputW : MonoBehaviour {", "  void Update() {", "    if (___BLANK_0___) {", "      Debug.Log(\"Maju\");", "    }", "  }", "}"], ["Input.GetKey(KeyCode.W)", "Input.GetKey(KeyCode.Space)", "Vector3.forward", "Time.deltaTime"], ["Input.GetKey(KeyCode.W)"], "move"),
  makeQuestion(7, "Mengatur Speed", "Lengkapi nilai variabel speed.", ["using UnityEngine;", "", "public class SpeedSetting : MonoBehaviour {", "  public float speed = ___BLANK_0___", "}"], ["5f;", "true;", "Vector3.up;", "Input.GetAxis;"], ["5f;"], "speed"),
  makeQuestion(8, "Menonaktifkan Objek", "Lengkapi script agar objek tidak aktif.", ["using UnityEngine;", "", "public class HideObject : MonoBehaviour {", "  void Hide() {", "    ___BLANK_0___", "  }", "}"], ["gameObject.SetActive(false);", "gameObject.SetActive(true);", "transform.Rotate(Vector3.up);", "Debug.Log(gameObject);"], ["gameObject.SetActive(false);"], "hide"),
  makeQuestion(9, "Gerak Stabil", "Lengkapi bagian agar gerakan stabil di berbagai frame rate.", ["using UnityEngine;", "", "public class StableMove : MonoBehaviour {", "  public float speed = 5f;", "  void Update() {", "    transform.Translate(Vector3.forward * speed * ___BLANK_0___);", "  }", "}"], ["Time.deltaTime", "Time.timeScale", "Vector3.zero", "Input.anyKey"], ["Time.deltaTime"], "move"),
  makeQuestion(10, "Menghapus Objek", "Lengkapi script agar objek dihapus dari scene.", ["using UnityEngine;", "", "public class DeleteObject : MonoBehaviour {", "  void Delete() {", "    ___BLANK_0___", "  }", "}"], ["Destroy(gameObject);", "gameObject.SetActive(true);", "transform.Translate(Vector3.up);", "Time.timeScale = 1;"], ["Destroy(gameObject);"], "hide")
];

const unityLevel2 = [
  makeQuestion(1, "Gerak Horizontal dan Vertical", "Lengkapi dua bagian kosong agar karakter bergerak berdasarkan input.", ["using UnityEngine;", "", "public class PlayerMove : MonoBehaviour {", "  public float speed = 5f;", "  void Update() {", "    float h = Input.GetAxis(\"Horizontal\");", "    float v = Input.GetAxis(\"Vertical\");", "    Vector3 direction = ___BLANK_0___", "    transform.Translate(___BLANK_1___);", "  }", "}"], ["new Vector3(h, 0, v);", "direction * speed * Time.deltaTime", "new Vector3(0, h, v);", "direction / speed", "Vector3.zero"], ["new Vector3(h, 0, v);", "direction * speed * Time.deltaTime"], "move"),
  makeQuestion(2, "Jump Saat Grounded", "Lengkapi script agar karakter hanya melompat saat menyentuh tanah.", ["using UnityEngine;", "", "public class PlayerJump : MonoBehaviour {", "  public Rigidbody rb;", "  public float jumpForce = 7f;", "  public bool isGrounded = true;", "  void Update() {", "    if (Input.GetKeyDown(KeyCode.Space) && ___BLANK_0___) {", "      ___BLANK_1___", "    }", "  }", "}"], ["isGrounded", "rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);", "!isGrounded", "transform.Rotate(Vector3.up);", "Time.deltaTime"], ["isGrounded", "rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);"], "jump"),
  makeQuestion(3, "Rotasi Halus", "Lengkapi script agar karakter berputar halus.", ["using UnityEngine;", "", "public class SmoothRotate : MonoBehaviour {", "  public float rotationSpeed = 120f;", "  void Update() {", "    float turn = Input.GetAxis(\"Horizontal\");", "    transform.Rotate(___BLANK_0___ * ___BLANK_1___);", "  }", "}"], ["Vector3.up", "turn * rotationSpeed * Time.deltaTime", "Vector3.forward", "rotationSpeed / Time.deltaTime", "Input.GetAxis(\"Vertical\")"], ["Vector3.up", "turn * rotationSpeed * Time.deltaTime"], "turn"),
  makeQuestion(4, "Deteksi Tanah", "Lengkapi script agar isGrounded menjadi true saat menyentuh tanah.", ["using UnityEngine;", "", "public class GroundCheck : MonoBehaviour {", "  public bool isGrounded = false;", "  void OnCollisionEnter(Collision collision) {", "    if (collision.gameObject.CompareTag(\"Ground\")) {", "      ___BLANK_0___ = ___BLANK_1___", "    }", "  }", "}"], ["isGrounded", "true;", "false;", "Time.deltaTime", "Vector3.up"], ["isGrounded", "true;"], "jump"),
  makeQuestion(5, "Collect Coin", "Lengkapi script agar skor bertambah dan coin hilang.", ["using UnityEngine;", "", "public class CoinCollector : MonoBehaviour {", "  public int score = 0;", "  void OnTriggerEnter(Collider other) {", "    if (other.CompareTag(\"Coin\")) {", "      ___BLANK_0___", "      ___BLANK_1___", "    }", "  }", "}"], ["score += 10;", "Destroy(other.gameObject);", "score -= 10;", "Destroy(gameObject);", "Time.timeScale = 0;"], ["score += 10;", "Destroy(other.gameObject);"], "score"),
  makeQuestion(6, "Animasi Berlari", "Lengkapi script agar animator menjalankan animasi lari.", ["using UnityEngine;", "", "public class RunAnimation : MonoBehaviour {", "  public Animator animator;", "  void Update() {", "    bool isMoving = Input.GetAxis(\"Vertical\") != 0;", "    animator.SetBool(___BLANK_0___, ___BLANK_1___);", "  }", "}"], ["\"isRunning\"", "isMoving", "false", "Vector3.up", "Time.deltaTime"], ["\"isRunning\"", "isMoving"], "move"),
  makeQuestion(7, "Batas Posisi", "Lengkapi script agar posisi X karakter dibatasi.", ["using UnityEngine;", "", "public class ClampPosition : MonoBehaviour {", "  void Update() {", "    float x = Mathf.Clamp(transform.position.x, ___BLANK_0___, ___BLANK_1___);", "  }", "}"], ["-5f", "5f", "0f", "10f", "Time.deltaTime"], ["-5f", "5f"], "move"),
  makeQuestion(8, "Camera Follow", "Lengkapi script agar kamera mengikuti target.", ["using UnityEngine;", "", "public class CameraFollow : MonoBehaviour {", "  public Transform target;", "  public Vector3 offset;", "  void LateUpdate() {", "    transform.position = ___BLANK_0___ + ___BLANK_1___;", "  }", "}"], ["target.position", "offset", "Vector3.zero", "Time.deltaTime", "target.rotation"], ["target.position", "offset"], "camera"),
  makeQuestion(9, "Memutar Audio", "Lengkapi script agar suara dimainkan.", ["using UnityEngine;", "", "public class PlaySound : MonoBehaviour {", "  public AudioSource audioSource;", "  void OnMouseDown() {", "    ___BLANK_0___.___BLANK_1___", "  }", "}"], ["audioSource", "Play();", "Stop();", "Time.deltaTime", "Vector3.forward"], ["audioSource", "Play();"], "message"),
  makeQuestion(10, "Restart Scene", "Lengkapi script agar scene aktif dimuat ulang.", ["using UnityEngine;", "using UnityEngine.SceneManagement;", "", "public class RestartLevel : MonoBehaviour {", "  public void Restart() {", "    SceneManager.LoadScene(___BLANK_0___.___BLANK_1___);", "  }", "}"], ["SceneManager.GetActiveScene()", "buildIndex", "Time.deltaTime", "Vector3.zero", "gameObject"], ["SceneManager.GetActiveScene()", "buildIndex"], "restart")
];

const unityLevel3 = [
  makeQuestion(1, "Analog Move", "Lengkapi script agar analog menggerakkan karakter.", ["using UnityEngine;", "", "public class AnalogMove : MonoBehaviour {", "  public float speed = 5f;", "  void Update() {", "    float h = Input.GetAxis(\"Horizontal\");", "    float v = Input.GetAxis(\"Vertical\");", "    Vector3 move = ___BLANK_0___", "    transform.Translate(___BLANK_1___);", "  }", "}"], ["new Vector3(h, 0, v);", "move * speed * Time.deltaTime", "new Vector3(0, h, v);", "move / speed", "Vector3.down"], ["new Vector3(h, 0, v);", "move * speed * Time.deltaTime"], "move"),
  makeQuestion(2, "Tombol Jump", "Lengkapi script agar tombol jump membuat karakter melompat.", ["using UnityEngine;", "", "public class JumpButton : MonoBehaviour {", "  public Rigidbody rb;", "  public float jumpForce = 8f;", "  public bool isGrounded = true;", "  void Update() {", "    if (Input.GetKeyDown(KeyCode.Space) && ___BLANK_0___) {", "      ___BLANK_1___", "    }", "  }", "}"], ["isGrounded", "rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);", "!isGrounded", "transform.Rotate(Vector3.up);", "Time.timeScale = 0;"], ["isGrounded", "rb.AddForce(Vector3.up * jumpForce, ForceMode.Impulse);"], "jump"),
  makeQuestion(3, "Rintangan Mengurangi Nyawa", "Lengkapi script agar nyawa berkurang saat menyentuh obstacle.", ["using UnityEngine;", "", "public class ObstacleHit : MonoBehaviour {", "  public int health = 3;", "  void OnCollisionEnter(Collision collision) {", "    if (collision.gameObject.CompareTag(___BLANK_0___)) {", "      ___BLANK_1___", "    }", "  }", "}"], ["\"Obstacle\"", "health -= 1;", "\"Coin\"", "health += 1;", "Destroy(gameObject);"], ["\"Obstacle\"", "health -= 1;"], "wrong"),
  makeQuestion(4, "Ambil Bonus", "Lengkapi script agar skor bertambah dan bonus hilang.", ["using UnityEngine;", "", "public class BonusItem : MonoBehaviour {", "  public int score = 0;", "  void OnTriggerEnter(Collider other) {", "    if (other.CompareTag(\"Bonus\")) {", "      ___BLANK_0___", "      ___BLANK_1___", "    }", "  }", "}"], ["score += 25;", "Destroy(other.gameObject);", "score -= 25;", "other.isTrigger = false;", "Time.timeScale = 0;"], ["score += 25;", "Destroy(other.gameObject);"], "score"),
  makeQuestion(5, "Checkpoint", "Lengkapi script agar posisi checkpoint tersimpan.", ["using UnityEngine;", "", "public class Checkpoint : MonoBehaviour {", "  public Vector3 respawnPoint;", "  void OnTriggerEnter(Collider other) {", "    if (other.CompareTag(\"Checkpoint\")) {", "      ___BLANK_0___ = ___BLANK_1___;", "    }", "  }", "}"], ["respawnPoint", "other.transform.position", "Vector3.down", "Time.deltaTime", "false"], ["respawnPoint", "other.transform.position"], "move"),
  makeQuestion(6, "Respawn", "Lengkapi script agar karakter kembali ke titik respawn.", ["using UnityEngine;", "", "public class RespawnPlayer : MonoBehaviour {", "  public Vector3 respawnPoint;", "  void Respawn() {", "    ___BLANK_0___ = ___BLANK_1___;", "  }", "}"], ["transform.position", "respawnPoint", "transform.rotation", "Vector3.up", "Time.deltaTime"], ["transform.position", "respawnPoint"], "move"),
  makeQuestion(7, "Dash ke Depan", "Lengkapi script agar karakter dash ke depan.", ["using UnityEngine;", "", "public class DashMove : MonoBehaviour {", "  public float dashPower = 4f;", "  void Update() {", "    if (Input.GetKeyDown(KeyCode.LeftShift)) {", "      transform.Translate(___BLANK_0___ * ___BLANK_1___);", "    }", "  }", "}"], ["Vector3.forward", "dashPower", "Vector3.down", "Time.timeScale", "false"], ["Vector3.forward", "dashPower"], "move"),
  makeQuestion(8, "Game Over", "Lengkapi script agar game berhenti ketika health habis.", ["using UnityEngine;", "", "public class GameOver : MonoBehaviour {", "  public int health = 0;", "  void Update() {", "    if (health <= ___BLANK_0___) {", "      Time.timeScale = ___BLANK_1___;", "    }", "  }", "}"], ["0", "0f", "1", "1f", "Vector3.zero"], ["0", "0f"], "wrong"),
  makeQuestion(9, "Animasi Jump", "Lengkapi script agar animator menjalankan trigger Jump.", ["using UnityEngine;", "", "public class JumpAnimation : MonoBehaviour {", "  public Animator animator;", "  void Jump() {", "    ___BLANK_0___.___BLANK_1___", "  }", "}"], ["animator", "SetTrigger(\"Jump\");", "SetBool(\"Run\", false);", "Time.deltaTime", "Vector3.up"], ["animator", "SetTrigger(\"Jump\");"], "jump"),
  makeQuestion(10, "Finish Level", "Lengkapi script agar status menang aktif saat menyentuh finish.", ["using UnityEngine;", "", "public class FinishLevel : MonoBehaviour {", "  public bool isWin = false;", "  void OnTriggerEnter(Collider other) {", "    if (other.CompareTag(___BLANK_0___)) {", "      ___BLANK_1___ = true;", "    }", "  }", "}"], ["\"Finish\"", "isWin", "\"Obstacle\"", "isGrounded", "score"], ["\"Finish\"", "isWin"], "win")
];

const threeLevel1 = unityLevel1.map((item, index) => ({
  ...item,
  title: ["Membuat Kubus", "Rotasi Objek", "Geser Objek", "Sphere Geometry", "Posisi Kamera", "Render Scene", "Ukuran Renderer", "Material Warna", "Tambah ke Scene", "Hapus dari Scene"][index],
  instruction: "Lengkapi script dasar Three.js sesuai perintah soal.",
  script: [
    ["const geometry = ___BLANK_0___", "const cube = new THREE.Mesh(geometry, material);", "scene.add(cube);"],
    ["function animate() {", "  requestAnimationFrame(animate);", "  ___BLANK_0___", "  renderer.render(scene, camera);", "}"],
    ["function moveObject() {", "  ___BLANK_0___", "}"],
    ["const geometry = ___BLANK_0___", "const sphere = new THREE.Mesh(geometry, material);"],
    ["const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);", "___BLANK_0___"],
    ["function animate() {", "  requestAnimationFrame(animate);", "  ___BLANK_0___", "}"],
    ["const renderer = new THREE.WebGLRenderer();", "___BLANK_0___"],
    ["const material = ___BLANK_0___", "const cube = new THREE.Mesh(geometry, material);"],
    ["const cube = new THREE.Mesh(geometry, material);", "___BLANK_0___"],
    ["function removeCube() {", "  ___BLANK_0___", "}"]
  ][index],
  options: [
    ["new THREE.BoxGeometry(1, 1, 1);", "new THREE.Scene();", "new THREE.Clock();", "new THREE.Fog();"],
    ["cube.rotation.y += 0.01;", "scene.clear();", "camera.remove();", "renderer.dispose();"],
    ["cube.position.x += 1;", "cube.visible = false;", "scene.clear();", "camera.position.z = 5;"],
    ["new THREE.SphereGeometry(1, 32, 16);", "new THREE.BoxGeometry();", "new THREE.Scene();", "new THREE.Clock();"],
    ["camera.position.z = 5;", "scene.add(camera);", "renderer.dispose();", "cube.rotation.x = 1;"],
    ["renderer.render(scene, camera);", "scene.remove(cube);", "camera.lookAt(renderer);", "renderer.clear();"],
    ["renderer.setSize(window.innerWidth, window.innerHeight);", "scene.setSize(1, 1);", "camera.setSize(100, 100);", "renderer.render();"],
    ["new THREE.MeshBasicMaterial({ color: 0xff0000 });", "new THREE.BoxGeometry(1, 1, 1);", "new THREE.Scene();", "new THREE.Clock();"],
    ["scene.add(cube);", "cube.add(scene);", "renderer.add(cube);", "camera.add(scene);"],
    ["scene.remove(cube);", "cube.remove(scene);", "camera.remove(scene);", "renderer.remove(cube);"]
  ][index],
  answer: [
    ["new THREE.BoxGeometry(1, 1, 1);"],
    ["cube.rotation.y += 0.01;"],
    ["cube.position.x += 1;"],
    ["new THREE.SphereGeometry(1, 32, 16);"],
    ["camera.position.z = 5;"],
    ["renderer.render(scene, camera);"],
    ["renderer.setSize(window.innerWidth, window.innerHeight);"],
    ["new THREE.MeshBasicMaterial({ color: 0xff0000 });"],
    ["scene.add(cube);"],
    ["scene.remove(cube);"]
  ][index],
  action: ["cube", "spin", "move", "cube", "camera", "spin", "cube", "cube", "cube", "hide"][index]
}));

const threeLevel2 = unityLevel2.map((item, index) => ({
  ...item,
  title: ["Mesh Lengkap", "Rotasi Dua Sumbu", "Posisi dan Skala", "Camera Renderer", "Loop Animasi", "Directional Light", "Orbit Controls", "Resize Window", "Raycaster", "Animasi Posisi"][index],
  instruction: "Lengkapi dua bagian script Three.js.",
  script: [
    ["const geometry = ___BLANK_0___", "const material = ___BLANK_1___", "const cube = new THREE.Mesh(geometry, material);"],
    ["function animate() {", "  requestAnimationFrame(animate);", "  ___BLANK_0___", "  ___BLANK_1___", "}"],
    ["function updateObject() {", "  ___BLANK_0___", "  ___BLANK_1___", "}"],
    ["camera.position.z = ___BLANK_0___", "renderer.setSize(___BLANK_1___);"],
    ["function animate() {", "  ___BLANK_0___", "  ___BLANK_1___", "}"],
    ["const light = ___BLANK_0___", "___BLANK_1___"],
    ["const controls = ___BLANK_0___", "controls.___BLANK_1___"],
    ["window.addEventListener(\"resize\", () => {", "  camera.aspect = ___BLANK_0___;", "  renderer.setSize(___BLANK_1___);", "});"],
    ["const raycaster = ___BLANK_0___", "const mouse = ___BLANK_1___"],
    ["function animate() {", "  cube.position.y = Math.sin(___BLANK_0___) * ___BLANK_1___;", "}"]
  ][index],
  options: [
    ["new THREE.BoxGeometry(1, 1, 1);", "new THREE.MeshBasicMaterial({ color: 0x38bdf8 });", "new THREE.Scene();", "requestAnimationFrame(animate);", "new THREE.Clock();"],
    ["cube.rotation.x += 0.01;", "cube.rotation.y += 0.01;", "scene.remove(cube);", "camera.position.z = 5;", "renderer.dispose();"],
    ["cube.position.x += 1;", "cube.scale.set(1.5, 1.5, 1.5);", "cube.visible = false;", "scene.clear();", "camera.remove();"],
    ["5;", "window.innerWidth, window.innerHeight", "0;", "scene, camera", "cube.position"],
    ["requestAnimationFrame(animate);", "renderer.render(scene, camera);", "scene.remove(cube);", "return false;", "camera.dispose();"],
    ["new THREE.DirectionalLight(0xffffff, 1);", "scene.add(light);", "new THREE.BoxGeometry();", "renderer.add(light);", "camera.add(scene);"],
    ["new OrbitControls(camera, renderer.domElement);", "update();", "render(scene);", "new THREE.Scene();", "dispose(scene);"],
    ["window.innerWidth / window.innerHeight", "window.innerWidth, window.innerHeight", "scene.width / scene.height", "cube.position.x", "Time.deltaTime"],
    ["new THREE.Raycaster();", "new THREE.Vector2();", "new THREE.Scene();", "new THREE.Clock();", "new THREE.Mesh();"],
    ["Date.now() * 0.001", "0.5", "Vector3.up", "renderer.domElement", "scene.position"]
  ][index],
  answer: [
    ["new THREE.BoxGeometry(1, 1, 1);", "new THREE.MeshBasicMaterial({ color: 0x38bdf8 });"],
    ["cube.rotation.x += 0.01;", "cube.rotation.y += 0.01;"],
    ["cube.position.x += 1;", "cube.scale.set(1.5, 1.5, 1.5);"],
    ["5;", "window.innerWidth, window.innerHeight"],
    ["requestAnimationFrame(animate);", "renderer.render(scene, camera);"],
    ["new THREE.DirectionalLight(0xffffff, 1);", "scene.add(light);"],
    ["new OrbitControls(camera, renderer.domElement);", "update();"],
    ["window.innerWidth / window.innerHeight", "window.innerWidth, window.innerHeight"],
    ["new THREE.Raycaster();", "new THREE.Vector2();"],
    ["Date.now() * 0.001", "0.5"]
  ][index],
  action: ["cube", "spin", "move", "camera", "spin", "cube", "turn", "camera", "message", "jump"][index]
}));

const threeLevel3 = unityLevel3.map((item, index) => ({
  ...item,
  title: ["Keyboard Move 3D", "Jump Object", "Obstacle 3D", "Collect Coin 3D", "Arena Limit", "Save Checkpoint", "Respawn 3D", "Finish Object", "Damage Effect", "Score UI"][index],
  instruction: "Lengkapi script praktik 3D, lalu uji karakter dengan analog dan tombol Jump.",
  script: [
    ["function update() {", "  const x = keyboard.right - keyboard.left;", "  cube.position.x += ___BLANK_0___ * ___BLANK_1___;", "}"],
    ["function jump() {", "  if (___BLANK_0___) {", "    cube.position.y += ___BLANK_1___;", "  }", "}"],
    ["function hitObstacle(object) {", "  if (object.name === ___BLANK_0___) {", "    ___BLANK_1___", "  }", "}"],
    ["function collectCoin(coin) {", "  ___BLANK_0___", "  ___BLANK_1___", "}"],
    ["cube.position.x = Math.max(___BLANK_0___, Math.min(___BLANK_1___, cube.position.x));"],
    ["function saveCheckpoint() {", "  ___BLANK_0___ = ___BLANK_1___.clone();", "}"],
    ["function respawn() {", "  cube.position.copy(___BLANK_0___);", "  ___BLANK_1___ = 3;", "}"],
    ["function finishGame(object) {", "  if (object.name === ___BLANK_0___) {", "    ___BLANK_1___ = true;", "  }", "}"],
    ["function damageEffect() {", "  cube.material.color.set(___BLANK_0___);", "  setTimeout(() => cube.material.color.set(___BLANK_1___), 300);", "}"],
    ["function updateScoreUI() {", "  document.getElementById(\"score\").textContent = ___BLANK_0___ + ___BLANK_1___;", "}"]
  ][index],
  options: [
    ["x", "speed", "camera", "scene", "renderer"],
    ["isGrounded", "jumpPower", "scene", "camera", "false"],
    ["\"Obstacle\"", "health -= 1;", "\"Coin\"", "score += 1;", "scene.clear();"],
    ["score += 10;", "scene.remove(coin);", "health -= 1;", "camera.remove(coin);", "renderer.clear();"],
    ["-5", "5", "0", "10", "camera.position.z"],
    ["checkpoint", "cube.position", "camera", "scene", "renderer"],
    ["checkpoint", "health", "scene", "renderer", "camera"],
    ["\"Finish\"", "isWin", "\"Obstacle\"", "isGrounded", "health"],
    ["0xff0000", "0x38bdf8", "scene", "camera", "false"],
    ["\"Score: \"", "score", "scene", "camera", "renderer"]
  ][index],
  answer: [
    ["x", "speed"],
    ["isGrounded", "jumpPower"],
    ["\"Obstacle\"", "health -= 1;"],
    ["score += 10;", "scene.remove(coin);"],
    ["-5", "5"],
    ["checkpoint", "cube.position"],
    ["checkpoint", "health"],
    ["\"Finish\"", "isWin"],
    ["0xff0000", "0x38bdf8"],
    ["\"Score: \"", "score"]
  ][index],
  action: ["move", "jump", "wrong", "score", "move", "move", "move", "win", "wrong", "score"][index]
}));

const questionSets = {
  unity: {
    1: unityLevel1,
    2: unityLevel2,
    3: unityLevel3
  },
  three: {
    1: threeLevel1,
    2: threeLevel2,
    3: threeLevel3
  }
};

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

function formatDate(dateString) {
  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(dateString));
  } catch {
    return "-";
  }
}


function splitScriptLine(line) {
  const result = [];
  let rest = line;

  while (rest.includes("___BLANK_")) {
    const start = rest.indexOf("___BLANK_");
    if (start > 0) result.push({ type: "text", value: rest.slice(0, start) });

    const end = rest.indexOf("___", start + 9);
    if (end === -1) {
      result.push({ type: "text", value: rest });
      return result;
    }

    const token = rest.slice(start, end + 3);
    const numberText = token.replace("___BLANK_", "").replace("___", "");
    result.push({ type: "blank", value: Number(numberText) });
    rest = rest.slice(end + 3);
  }

  if (rest.length > 0) result.push({ type: "text", value: rest });
  return result;
}

const RUNNER_TRACK_WIDTH = 1200;
const RUNNER_PLAYER_X = -155;

const runnerObstacles = [
  { id: 1, start: 700 },
  { id: 2, start: 930 },
  { id: 3, start: 1130 }
];

function getRunnerObstacleX(start, distance) {
  const normalized = (start - (distance % RUNNER_TRACK_WIDTH) + RUNNER_TRACK_WIDTH) % RUNNER_TRACK_WIDTH;
  return normalized - RUNNER_TRACK_WIDTH / 2;
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [mode, setMode] = useState("unity");
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [groupName, setGroupName] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [filled, setFilled] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180);
  const [isFinished, setIsFinished] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [history, setHistory] = useState(loadHistory);
  const [characterAction, setCharacterAction] = useState("idle");
  const [playerX, setPlayerX] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [level3PracticeUnlocked, setLevel3PracticeUnlocked] = useState(false);
  const [runnerDistance, setRunnerDistance] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [practiceMessage, setPracticeMessage] = useState("Selesaikan semua soal Level 3 untuk membuka mode lari.");
  const savedRef = useRef(false);

  const questions = questionSets[mode][selectedLevel];
  const currentQuestion = questions[questionIndex];
  const modeLabel = mode === "unity" ? "Quiz Unity" : "Quiz 3D";

  const optionBank = useMemo(() => {
    return shuffleArray(currentQuestion.options);
  }, [currentQuestion]);

  const finishGame = useCallback((finalScore, finalAttempts, status) => {
    if (savedRef.current) return;
    savedRef.current = true;
    setIsFinished(true);

    const record = {
      id: Date.now(),
      groupName: groupName.trim(),
      mode: modeLabel,
      level: selectedLevel,
      score: finalScore,
      attempts: finalAttempts,
      status,
      completedQuestions: status === "Selesai" ? questions.length : questionIndex,
      totalQuestions: questions.length,
      playedAt: new Date().toISOString()
    };

    setHistory((prev) => [record, ...prev].slice(0, 30));
  }, [groupName, modeLabel, questionIndex, questions.length, selectedLevel]);

  useEffect(() => {
    saveHistory(history);
  }, [history]);

  useEffect(() => {
    if (screen !== "game" || isFinished) return;
    if (timeLeft <= 0) {
      finishGame(score, attempts, "Waktu habis");
      setFeedback("Waktu habis. Skor sudah disimpan ke history.");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, timeLeft, isFinished, score, attempts, finishGame]);

  useEffect(() => {
    if (screen !== "game" || selectedLevel !== 3 || !level3PracticeUnlocked || !isRunning) return;

    const runner = setInterval(() => {
      setRunnerDistance((prev) => prev + 6);
      setCharacterAction("move");
    }, 50);

    return () => clearInterval(runner);
  }, [screen, selectedLevel, level3PracticeUnlocked, isRunning]);

  useEffect(() => {
    if (screen !== "game" || selectedLevel !== 3 || !level3PracticeUnlocked || !isRunning || isJumping) return;

    const hitObstacle = runnerObstacles.some((obs) => Math.abs(getRunnerObstacleX(obs.start, runnerDistance) - RUNNER_PLAYER_X) < 34);

    if (hitObstacle) {
      setIsRunning(false);
      setCharacterAction("wrong");
      setPracticeMessage("Terkena rintangan. Tekan Jump lebih awal, lalu tekan tombol kanan untuk lanjut berlari.");
      setTimeout(() => setCharacterAction("idle"), 600);
    }
  }, [runnerDistance, screen, selectedLevel, level3PracticeUnlocked, isRunning, isJumping]);

  useEffect(() => {
    setFilled(Array(currentQuestion.blanks).fill(null));
    setFeedback("");
    setCharacterAction("idle");
  }, [currentQuestion]);

  const formattedTime = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

  function chooseMode(nextMode) {
    setMode(nextMode);
    setSelectedLevel(1);
    setScreen("group");
    setFeedback("");
  }

  function startGame() {
    if (!groupName.trim()) {
      setFeedback("Nama kelompok wajib diisi.");
      return;
    }

    savedRef.current = false;
    setQuestionIndex(0);
    setScore(0);
    setAttempts(0);
    setIsFinished(false);
    setTimeLeft(selectedLevel === 1 ? 180 : selectedLevel === 2 ? 240 : 300);
    setPlayerX(0);
    setIsJumping(false);
    setLevel3PracticeUnlocked(false);
    setRunnerDistance(0);
    setIsRunning(false);
    setPracticeMessage(selectedLevel === 3 ? "Selesaikan semua soal Level 3 untuk membuka mode lari." : "Karakter bergerak setelah script benar.");
    setScreen("game");
    setFeedback("");
  }

  function resetAll() {
    savedRef.current = false;
    setScreen("home");
    setMode("unity");
    setSelectedLevel(1);
    setGroupName("");
    setQuestionIndex(0);
    setFilled([]);
    setFeedback("");
    setScore(0);
    setTimeLeft(180);
    setIsFinished(false);
    setAttempts(0);
    setCharacterAction("idle");
    setPlayerX(0);
    setIsJumping(false);
    setLevel3PracticeUnlocked(false);
    setRunnerDistance(0);
    setIsRunning(false);
    setPracticeMessage("Selesaikan semua soal Level 3 untuk membuka mode lari.");
  }

  function fillBlank(codeBlock) {
    if (isFinished) return;
    const emptyIndex = filled.findIndex((item) => item === null);
    if (emptyIndex === -1) return;
    const nextFilled = [...filled];
    nextFilled[emptyIndex] = codeBlock;
    setFilled(nextFilled);
    setFeedback("");
  }

  function removeBlock(blankIndex) {
    if (isFinished) return;
    const nextFilled = [...filled];
    nextFilled[blankIndex] = null;
    setFilled(nextFilled);
  }

  function checkAnswer() {
    if (filled.some((item) => item === null)) {
      setFeedback("Masih ada bagian script yang kosong.");
      return;
    }

    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    const correct = filled.every((item, index) => item === currentQuestion.answer[index]);

    if (!correct) {
      setFeedback("Jawaban belum tepat. Periksa kembali urutan logika script.");
      setCharacterAction("wrong");
      setTimeout(() => setCharacterAction("idle"), 700);
      return;
    }

    const timeBonus = Math.max(5, Math.floor(timeLeft / 12));
    const levelBonus = selectedLevel === 2 ? 10 : selectedLevel === 3 ? 18 : 0;
    const point = 20 + timeBonus + levelBonus;
    const nextScore = score + point;

    setScore(nextScore);
    setFeedback(`Benar. Karakter menjalankan fungsi script. +${point} poin.`);
    setCharacterAction(currentQuestion.action);

    if (selectedLevel === 3) {
      setPracticeMessage(
        questionIndex === questions.length - 1
          ? "Semua jawaban benar. Mode lari akan dibuka setelah skor disimpan."
          : "Jawaban benar. Lanjutkan sampai semua soal selesai untuk membuka mode lari."
      );
    }

    setTimeout(() => {
      if (questionIndex === questions.length - 1) {
        finishGame(nextScore, nextAttempts, "Selesai");

        if (selectedLevel === 3) {
          setLevel3PracticeUnlocked(true);
          setRunnerDistance(0);
          setIsRunning(true);
          setPracticeMessage("Mode lari aktif. Karakter terus berlari ke kanan. Tekan Jump untuk melewati rintangan.");
          setFeedback("Selamat. Semua soal selesai. Skor sudah disimpan. Mode lari Level 3 sekarang terbuka.");
        } else {
          setFeedback("Selamat. Semua soal selesai. Skor sudah disimpan ke history.");
        }
      } else {
        setQuestionIndex((prev) => prev + 1);
      }
    }, 900);
  }

  function clearHistory() {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  function movePlayer(dx) {
    if (selectedLevel !== 3) return;

    if (!level3PracticeUnlocked) {
      setPracticeMessage("Mode lari masih terkunci. Selesaikan semua soal Level 3 terlebih dahulu.");
      return;
    }

    if (dx > 0) {
      setIsRunning(true);
      setRunnerDistance((prev) => prev + 45);
      setCharacterAction("move");
      setPracticeMessage("Karakter berlari ke kanan. Tekan Jump sebelum rintangan menyentuh karakter.");
    } else if (dx < 0) {
      setIsRunning(false);
      setCharacterAction("idle");
      setPracticeMessage("Lari dijeda. Tekan tombol kanan untuk lanjut berlari.");
    } else {
      setIsRunning((prev) => {
        const nextRunning = !prev;
        setPracticeMessage(nextRunning ? "Mode lari dilanjutkan." : "Mode lari dijeda.");
        return nextRunning;
      });
    }
  }

  function resetRunner() {
    if (selectedLevel !== 3 || !level3PracticeUnlocked) return;
    setRunnerDistance(0);
    setIsRunning(true);
    setCharacterAction("move");
    setPracticeMessage("Mode lari diulang dari awal. Karakter mulai berlari lagi.");
  }

  function jumpPlayer() {
    if (selectedLevel !== 3 || !level3PracticeUnlocked || isJumping) {
      if (selectedLevel === 3 && !level3PracticeUnlocked) {
        setPracticeMessage("Tombol Jump aktif setelah semua soal Level 3 selesai.");
      }
      return;
    }

    setIsJumping(true);
    setCharacterAction("jump");
    setPracticeMessage("Karakter melompat. Gunakan timing yang tepat untuk melewati rintangan.");
    setTimeout(() => {
      setIsJumping(false);
      setCharacterAction(isRunning ? "move" : "idle");
    }, 700);
  }

  function renderScriptLine(line, lineIndex) {
    const parts = splitScriptLine(line);
    const hasBlank = parts.some((part) => part.type === "blank");

    if (!hasBlank) {
      return (
        <div key={lineIndex} className="min-h-[24px] whitespace-pre-wrap">
          {line || " "}
        </div>
      );
    }

    return (
      <div key={lineIndex} className="flex min-h-[38px] flex-wrap items-center gap-2 whitespace-pre-wrap">
        {parts.map((part, partIndex) => {
          if (part.type === "text") {
            return <span key={`${lineIndex}-text-${partIndex}`}>{part.value}</span>;
          }

          const blankIndex = part.value;
          return (
            <button
              key={`${lineIndex}-blank-${partIndex}`}
              onClick={() => removeBlock(blankIndex)}
              className={`min-h-[34px] min-w-[200px] max-w-full rounded-xl border px-3 py-1 text-left text-xs transition ${
                filled[blankIndex]
                  ? "border-sky-400 bg-sky-500/15 text-sky-100"
                  : "border-dashed border-slate-500 bg-slate-800/80 text-slate-400"
              }`}
            >
              {filled[blankIndex] || `Bagian kosong ${blankIndex + 1}`}
            </button>
          );
        })}
      </div>
    );
  }

  function CharacterPreview() {
    const animation =
      selectedLevel === 3
        ? {
            x: level3PracticeUnlocked ? RUNNER_PLAYER_X : playerX,
            y: isJumping ? [0, -85, 0] : 0,
            rotate: characterAction === "wrong" ? [0, -6, 6, -4, 4, 0] : 0,
            scale: isRunning ? [1, 1.03, 1] : 1
          }
        : characterAction === "move"
        ? { x: [0, 80, 0] }
        : characterAction === "jump"
        ? { y: [0, -90, 0] }
        : characterAction === "turn"
        ? { rotateY: [0, 180, 360] }
        : characterAction === "wrong"
        ? { x: [0, -12, 12, -8, 8, 0] }
        : characterAction === "spin"
        ? { rotate: [0, 360] }
        : characterAction === "cube"
        ? { scale: [1, 1.18, 1] }
        : { x: 0, y: 0, rotate: 0 };

    return (
      <div>
        <div className="relative mt-5 h-[360px] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-800 to-slate-950">
          {selectedLevel === 3 && level3PracticeUnlocked && (
            <>
              <div className="absolute right-4 top-4 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-2 text-xs font-semibold text-slate-200">
                Jarak: {Math.floor(runnerDistance / 10)} m
              </div>
              {runnerObstacles.map((obs) => {
                const obstacleX = getRunnerObstacleX(obs.start, runnerDistance);
                return (
                  <div
                    key={obs.id}
                    className="absolute bottom-[76px] left-1/2 h-12 w-8 rounded-lg bg-rose-400/80 shadow-lg shadow-rose-500/20"
                    style={{ transform: `translateX(${obstacleX}px)` }}
                  />
                );
              })}
            </>
          )}

          <div className="absolute bottom-16 left-6 right-6 h-4 rounded-full bg-emerald-500/20" />
          <div className="absolute bottom-14 left-6 right-6 h-1 rounded-full bg-emerald-300/40" />

          <motion.div
            className="absolute bottom-20 left-1/2 flex -translate-x-1/2 flex-col items-center"
            animate={animation}
            transition={{ duration: 0.75, ease: "easeInOut" }}
          >
            {mode === "three" ? (
              <div className="relative h-28 w-28">
                <div className="absolute inset-0 rotate-45 rounded-2xl border border-violet-200/40 bg-violet-400/30 shadow-2xl shadow-violet-500/30" />
                <div className="absolute inset-4 rotate-45 rounded-xl border border-white/20 bg-violet-200/20" />
              </div>
            ) : (
              <>
                <div className="relative h-20 w-20 rounded-full border border-sky-200/50 bg-sky-300 shadow-lg shadow-sky-500/30">
                  <div className="absolute left-5 top-7 h-2 w-2 rounded-full bg-slate-900" />
                  <div className="absolute right-5 top-7 h-2 w-2 rounded-full bg-slate-900" />
                  <div className="absolute bottom-5 left-1/2 h-2 w-8 -translate-x-1/2 rounded-full bg-slate-900/70" />
                </div>
                <div className="mt-2 h-24 w-20 rounded-3xl border border-emerald-200/40 bg-emerald-400 shadow-lg shadow-emerald-500/20" />
                <div className="mt-1 flex gap-4">
                  <div className="h-12 w-5 rounded-full bg-slate-300" />
                  <div className="h-12 w-5 rounded-full bg-slate-300" />
                </div>
              </>
            )}
          </motion.div>
        </div>

        {selectedLevel === 3 && (
          <div className="mt-4 rounded-3xl border border-white/10 bg-slate-900/70 p-4">
            <p className="mb-3 text-sm text-slate-300">{practiceMessage}</p>
            <div className="mb-3 rounded-2xl border border-white/10 bg-slate-950/70 p-3 text-xs leading-5 text-slate-400">
              {level3PracticeUnlocked
                ? "Mode lari sudah aktif. Tombol kanan menjalankan karakter, kiri menjeda, MID mengulang lintasan, dan Jump untuk melewati rintangan."
                : "Kontrol Level 3 terkunci sampai semua soal dijawab benar."}
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="grid w-44 grid-cols-3 gap-2">
                <div />
                <button onClick={jumpPlayer} disabled={!level3PracticeUnlocked} className="rounded-2xl bg-white/10 p-3 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"><ArrowUp className="mx-auto h-5 w-5" /></button>
                <div />
                <button onClick={() => movePlayer(-35)} disabled={!level3PracticeUnlocked} className="rounded-2xl bg-white/10 p-3 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"><ArrowLeft className="mx-auto h-5 w-5" /></button>
                <button onClick={resetRunner} disabled={!level3PracticeUnlocked} className="rounded-2xl bg-slate-800 p-3 text-xs font-bold hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40">MID</button>
                <button onClick={() => movePlayer(35)} disabled={!level3PracticeUnlocked} className="rounded-2xl bg-white/10 p-3 hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"><ArrowRight className="mx-auto h-5 w-5" /></button>
                <div />
                <button onClick={() => movePlayer(0)} disabled={!level3PracticeUnlocked} className="rounded-2xl bg-white/10 p-3 text-xs font-bold hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40">{isRunning ? "Pause" : "Start"}</button>
                <div />
              </div>
              <button onClick={jumpPlayer} disabled={!level3PracticeUnlocked} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:shadow-none">
                <ChevronsUp className="h-5 w-5" /> Jump
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  function HistoryTable() {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
        <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/30">
              <ListChecks className="h-4 w-4" /> History Skor
            </div>
            <h2 className="text-xl font-bold">Riwayat Kelompok yang Sudah Main</h2>
            <p className="mt-1 text-sm text-slate-300">History hanya tampil di halaman awal agar layar game tetap fokus.</p>
          </div>
          {history.length > 0 && (
            <button onClick={clearHistory} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-100 hover:bg-rose-500/20">
              <Trash2 className="h-4 w-4" /> Hapus History
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-600 bg-slate-900/60 p-5 text-sm text-slate-400">
            Belum ada kelompok yang menyelesaikan permainan.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] border-separate border-spacing-y-2 text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2">Kelompok</th>
                  <th className="px-3 py-2">Mode</th>
                  <th className="px-3 py-2">Level</th>
                  <th className="px-3 py-2">Skor</th>
                  <th className="px-3 py-2">Percobaan</th>
                  <th className="px-3 py-2">Progress</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Waktu</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => (
                  <tr key={item.id} className="bg-slate-900/80 text-slate-200">
                    <td className="rounded-l-2xl px-3 py-3 font-semibold">{item.groupName}</td>
                    <td className="px-3 py-3">{item.mode}</td>
                    <td className="px-3 py-3">Level {item.level}</td>
                    <td className="px-3 py-3 font-bold text-emerald-200">{item.score}</td>
                    <td className="px-3 py-3">{item.attempts}</td>
                    <td className="px-3 py-3">{item.completedQuestions}/{item.totalQuestions}</td>
                    <td className="px-3 py-3">{item.status}</td>
                    <td className="rounded-r-2xl px-3 py-3 text-slate-400">{formatDate(item.playedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-6 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col justify-between gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/50 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200 ring-1 ring-sky-400/30">
              <Gamepad2 className="h-4 w-4" /> Media Pembelajaran Interaktif
            </div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">Puzzle Script Unity dan 3D</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300 sm:text-base">
              Siswa menyusun potongan kode, memeriksa logika program, lalu melihat karakter menjalankan fungsi sesuai script.
            </p>
          </div>
          <button onClick={resetAll} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white hover:bg-white/15">
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </header>

        {screen === "home" && (
          <main className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <button onClick={() => chooseMode("unity")} className="rounded-3xl border border-sky-400/30 bg-sky-500/10 p-6 text-left shadow-xl transition hover:-translate-y-1 hover:bg-sky-500/15">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-400/20 text-sky-200"><Code2 className="h-8 w-8" /></div>
                <h2 className="text-2xl font-bold">Quiz Unity</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">3 level, masing-masing 10 soal. Level 3 memiliki analog, jump, dan rintangan.</p>
                <div className="mt-6 rounded-2xl bg-slate-900/80 p-4 font-mono text-xs text-slate-300">transform.Translate(...);<br />rb.AddForce(...);<br />OnCollisionEnter(...);</div>
              </button>

              <button onClick={() => chooseMode("three")} className="rounded-3xl border border-violet-400/30 bg-violet-500/10 p-6 text-left shadow-xl transition hover:-translate-y-1 hover:bg-violet-500/15">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-400/20 text-violet-200"><Cuboid className="h-8 w-8" /></div>
                <h2 className="text-2xl font-bold">Quiz 3D</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">3 level, masing-masing 10 soal tentang objek 3D, kamera, animasi, rintangan, dan skor.</p>
                <div className="mt-6 rounded-2xl bg-slate-900/80 p-4 font-mono text-xs text-slate-300">new THREE.BoxGeometry(...);<br />cube.rotation.y += ...;<br />scene.remove(...);</div>
              </button>
            </div>
            <HistoryTable />
          </main>
        )}

        {screen === "group" && (
          <main className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-200"><Users className="h-8 w-8" /></div>
            <h2 className="text-2xl font-bold">Masukkan Nama Kelompok</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">Pilih level, lalu mulai game. Skor akan tersimpan otomatis setelah selesai.</p>
            <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Contoh: Kelompok 1 - Kreator Game" className="mt-6 w-full rounded-2xl border border-white/10 bg-slate-900 px-4 py-4 text-base outline-none ring-sky-400/40 placeholder:text-slate-500 focus:ring-4" />

            <div className="mt-6">
              <h3 className="mb-3 text-sm font-bold text-slate-200">Pilih Level</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((level) => (
                  <button key={level} onClick={() => setSelectedLevel(level)} className={`rounded-2xl border p-4 text-left transition ${selectedLevel === level ? "border-sky-400 bg-sky-500/20 text-sky-50" : "border-white/10 bg-slate-900/70 text-slate-300 hover:bg-white/10"}`}>
                    <div className="text-lg font-bold">Level {level}</div>
                    <div className="mt-1 text-sm leading-6">
                      {level === 1 && "Dasar. 1 bagian script kosong."}
                      {level === 2 && "Lanjutan. 2 bagian script kosong."}
                      {level === 3 && "Praktik. Script, analog, jump, dan rintangan."}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {feedback && <p className="mt-3 text-sm text-amber-200">{feedback}</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => setScreen("home")} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold hover:bg-white/15">Kembali</button>
              <button onClick={startGame} className="rounded-2xl bg-sky-500 px-5 py-3 font-semibold text-white shadow-lg shadow-sky-500/30 hover:bg-sky-400">Mulai {modeLabel} Level {selectedLevel}</button>
            </div>
          </main>
        )}

        {screen === "game" && (
          <main className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
            <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
              <div className="mb-5 grid gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-slate-900 p-4"><div className="text-xs text-slate-400">Kelompok</div><div className="mt-1 truncate font-bold">{groupName}</div></div>
                <div className="rounded-2xl bg-slate-900 p-4"><div className="text-xs text-slate-400">Level</div><div className="mt-1 font-bold">Level {selectedLevel}</div></div>
                <div className="rounded-2xl bg-slate-900 p-4"><div className="flex items-center gap-2 text-xs text-slate-400"><Timer className="h-4 w-4" /> Waktu</div><div className={`mt-1 font-mono text-xl font-bold ${timeLeft <= 30 ? "text-rose-300" : "text-white"}`}>{formattedTime}</div></div>
                <div className="rounded-2xl bg-slate-900 p-4"><div className="flex items-center gap-2 text-xs text-slate-400"><Trophy className="h-4 w-4" /> Skor</div><div className="mt-1 text-xl font-bold">{score}</div></div>
              </div>

              <div className="mb-5 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-sky-300">{modeLabel} | Level {selectedLevel} | Soal {questionIndex + 1} dari {questions.length}</div>
                <h2 className="text-xl font-bold">{currentQuestion.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">{currentQuestion.instruction}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950 p-4 font-mono text-xs leading-6 text-slate-200 sm:text-sm">
                {currentQuestion.script.map((line, index) => renderScriptLine(line, index))}
              </div>

              <div className="mt-5">
                <h3 className="mb-3 text-sm font-bold text-slate-200">Potongan Puzzle Kode</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  {optionBank.map((option) => {
                    const used = filled.includes(option);
                    return (
                      <button key={option} onClick={() => fillBlank(option)} disabled={used || isFinished} className={`rounded-2xl border px-4 py-3 text-left font-mono text-xs transition sm:text-sm ${used ? "cursor-not-allowed border-slate-700 bg-slate-800 text-slate-500" : "border-sky-400/30 bg-sky-500/10 text-sky-100 hover:bg-sky-500/20"}`}>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button onClick={checkAnswer} disabled={isFinished} className="rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-700">Jalankan Script</button>
                <button onClick={() => setFilled(Array(currentQuestion.blanks).fill(null))} disabled={isFinished} className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 font-semibold hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50">Kosongkan Jawaban</button>
                {feedback && <p className={`text-sm font-medium ${feedback.includes("Benar") || feedback.includes("Selamat") ? "text-emerald-200" : "text-amber-200"}`}>{feedback}</p>}
              </div>
            </section>

            <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-xl">
              <h3 className="text-lg font-bold">Preview Karakter</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">Karakter bergerak setelah script benar. Pada Level 3, kontrol lari dibuka setelah semua soal selesai.</p>
              <CharacterPreview />

              <div className="mt-5 rounded-2xl bg-slate-900 p-4">
                <div className="text-xs text-slate-400">Status</div>
                <div className="mt-1 font-semibold">{level3PracticeUnlocked ? (isRunning ? "Mode lari aktif" : "Mode lari dijeda") : isFinished ? "Permainan selesai" : characterAction === "idle" ? "Menunggu script dijalankan" : "Menjalankan fungsi script"}</div>
              </div>

              {isFinished && (
                <div className="mt-5 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-5">
                  <h3 className="text-xl font-bold text-emerald-100">Hasil Akhir</h3>
                  <p className="mt-2 text-sm text-emerald-50/90">Kelompok: {groupName}</p>
                  <p className="mt-1 text-sm text-emerald-50/90">Mode: {modeLabel}</p>
                  <p className="mt-1 text-sm text-emerald-50/90">Level: {selectedLevel}</p>
                  <p className="mt-1 text-sm text-emerald-50/90">Skor: {score}</p>
                  <p className="mt-1 text-sm text-emerald-50/90">Percobaan: {attempts}</p>
                  {selectedLevel === 3 && <p className="mt-3 rounded-2xl bg-slate-950/30 p-3 text-sm text-emerald-50/90">Mode lari tetap aktif di preview. Siswa masih bisa menggerakkan karakter setelah skor tersimpan.</p>}
                  <button onClick={resetAll} className="mt-4 w-full rounded-2xl bg-emerald-500 px-4 py-3 font-bold text-white hover:bg-emerald-400">Kembali ke Halaman Awal</button>
                </div>
              )}
            </aside>
          </main>
        )}
      </div>
    </div>
  );
}
