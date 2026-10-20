/* ============================================================
   sprites.js — Milestone 8 (pixel pass): inline-SVG pixel art.
   Each sprite is a self-contained SVG string drawn on a small pixel
   grid (shape-rendering: crispEdges). Furniture stretches to fill its
   object box (preserveAspectRatio none); the character keeps its
   proportions. No asset files — stays offline.
   ============================================================ */
window.Diskarte = window.Diskarte || {};

(function () {
  var fill = "width='100%' height='100%' preserveAspectRatio='none' shape-rendering='crispEdges'";
  var fit = "width='100%' height='100%' preserveAspectRatio='xMidYMax meet' shape-rendering='crispEdges'";

  Diskarte.sprites = {

    window:
      "<svg " + fill + " viewBox='0 0 37 30' xmlns='http://www.w3.org/2000/svg'>" +
      "<rect width='37' height='30' fill='#54391e'/>" +
      "<rect x='3' y='3' width='31' height='24' fill='#6aa0cf'/>" +
      "<rect x='3' y='3' width='31' height='9' fill='#8cc0e6'/>" +
      "<circle cx='28' cy='9' r='4' fill='#ffe08a'/>" +
      "<rect x='6' y='18' width='10' height='9' fill='#5a86b0'/>" +
      "<rect x='17' y='3' width='3' height='24' fill='#54391e'/>" +
      "<rect x='3' y='13' width='31' height='3' fill='#54391e'/></svg>",

    door:
      "<svg " + fill + " viewBox='0 0 24 40' xmlns='http://www.w3.org/2000/svg'>" +
      "<rect width='24' height='40' fill='#54391e'/>" +
      "<rect x='2' width='20' height='40' fill='#7a5330'/>" +
      "<rect x='4' y='3' width='16' height='15' fill='#54391e'/>" +
      "<rect x='4' y='21' width='16' height='16' fill='#54391e'/>" +
      "<rect x='5' y='4' width='14' height='13' fill='#6b4a2b'/>" +
      "<rect x='5' y='22' width='14' height='14' fill='#6b4a2b'/>" +
      "<circle cx='18' cy='20' r='2' fill='#ffc566'/></svg>",

    bed:
      "<svg " + fill + " viewBox='0 0 52 35' xmlns='http://www.w3.org/2000/svg'>" +
      "<rect x='0' y='6' width='52' height='29' fill='#54391e'/>" +
      "<rect x='0' y='2' width='4' height='33' fill='#7a5330'/>" +
      "<rect x='48' y='2' width='4' height='33' fill='#7a5330'/>" +
      "<rect x='3' y='12' width='46' height='16' fill='#3a4a7a'/>" +
      "<rect x='3' y='12' width='46' height='4' fill='#4a5c92'/>" +
      "<rect x='5' y='9' width='18' height='9' fill='#e9eef2'/>" +
      "<rect x='5' y='9' width='18' height='3' fill='#ffffff'/></svg>",

    /* desk + laptop (the Plan Budget object). Phone is separate. */
    desk:
      "<svg " + fill + " viewBox='0 0 80 46' xmlns='http://www.w3.org/2000/svg'>" +
      "<rect x='4' y='18' width='72' height='9' fill='#7a5330'/>" +
      "<rect x='4' y='18' width='72' height='3' fill='#9c6d3f'/>" +
      "<rect x='4' y='24' width='72' height='3' fill='#54391e'/>" +
      "<rect x='8' y='27' width='5' height='18' fill='#54391e'/>" +
      "<rect x='67' y='27' width='5' height='18' fill='#54391e'/>" +
      "<rect x='44' y='2' width='26' height='16' fill='#1a1a2e'/>" +
      "<rect x='46' y='4' width='22' height='12' fill='#43AA8B'/>" +
      "<rect x='46' y='4' width='22' height='3' fill='#79ddba'/>" +
      "<rect x='42' y='17' width='30' height='3' fill='#0d0d1c'/></svg>",

    phone:
      "<svg " + fill + " viewBox='0 0 8 14' xmlns='http://www.w3.org/2000/svg'>" +
      "<rect width='8' height='14' fill='#0c0c14'/>" +
      "<rect x='1' y='2' width='6' height='9' fill='#1b2742'/>" +
      "<rect x='3' width='2' height='2' fill='#E63946'/></svg>",

    plant:
      "<svg " + fit + " viewBox='0 0 18 20' xmlns='http://www.w3.org/2000/svg'>" +
      "<ellipse cx='9' cy='18' rx='8' ry='2' fill='#000' opacity='0.3'/>" +
      "<rect x='5' y='13' width='8' height='6' fill='#5a3a22'/>" +
      "<rect x='5' y='13' width='8' height='2' fill='#7a5330'/>" +
      "<rect x='3' y='6' width='5' height='7' fill='#3b7d2a'/>" +
      "<rect x='8' y='8' width='4' height='5' fill='#4f9c38'/>" +
      "<rect x='10' y='5' width='4' height='8' fill='#3b7d2a'/></svg>",

    /* the Iskolar — keeps proportions, feet on the floor */
    character:
      "<svg " + fit + " viewBox='0 0 17 26' xmlns='http://www.w3.org/2000/svg'>" +
      "<ellipse cx='8' cy='25' rx='7' ry='1.6' fill='#000' opacity='0.3'/>" +
      "<rect x='4' width='9' height='4' fill='#2a1a0f'/>" +
      "<rect x='3' y='2' width='11' height='5' fill='#2a1a0f'/>" +
      "<rect x='4' y='4' width='9' height='4' fill='#e0a868'/>" +
      "<rect x='3' y='4' width='2' height='4' fill='#2a1a0f'/>" +
      "<rect x='12' y='4' width='2' height='4' fill='#2a1a0f'/>" +
      "<rect x='6' y='5' width='1' height='1' fill='#1a1a2e'/>" +
      "<rect x='10' y='5' width='1' height='1' fill='#1a1a2e'/>" +
      "<rect x='3' y='8' width='11' height='8' fill='#FF9F1C'/>" +
      "<rect x='11' y='8' width='3' height='8' fill='#c77d12'/>" +
      "<rect x='7' y='8' width='3' height='8' fill='#F1FAEE'/>" +
      "<rect x='1' y='9' width='2' height='6' fill='#e0a868'/>" +
      "<rect x='14' y='9' width='2' height='6' fill='#c78a4a'/>" +
      "<rect x='4' y='16' width='4' height='7' fill='#343455'/>" +
      "<rect x='9' y='16' width='4' height='7' fill='#2a2a44'/>" +
      "<rect x='3' y='23' width='5' height='2' fill='#15151f'/>" +
      "<rect x='9' y='23' width='5' height='2' fill='#15151f'/></svg>"
  };
})();
