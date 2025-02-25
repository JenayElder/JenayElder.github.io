<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bean Bounce</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #6BD0E7; /* Light blue background */
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            overflow: hidden;
        }
        canvas {
            border: 1px solid black;
        }
        #startButton {
            position: absolute;
            top: 60%; /* Moved down to 60% of the canvas height */
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 10px 20px;
            font-family: 'Montserrat', Arial, sans-serif;
            font-size: 18px;
            cursor: pointer;
            display: block; /* Ensure button is visible initially */
        }
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap" rel="stylesheet">
</head>
<body>
    <canvas id="gameCanvas" width="800" height="600"></canvas>
    <button id="startButton">Start Game</button>
    <script src="game.js"></script>
</body>
</html>
