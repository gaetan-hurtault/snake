/**
 * @property {number} taillePixel taille du grillage du jeu
 * @property {number]} largeur nombre de colonne du jeu
 * @property {number} hauteur nombre de ligne du jeu
 * @property {string} state état du jeu (arrêt,lancé,perdu)
 * @property {function} animation variable de l'animation
 * @property {string} direction direction dans laquelle se dirige le serpent
 * @property {number} vitesse vitesse de base du serpent
 * @property {number[[]]} mySnake tableau de tableau des positions du corps du serpent
 * @property {number[]} bonbon tableau de la postion du bonbon
 * @property {HTMLElement} root base du DOM shadow
 */
class Snake extends HTMLElement {
    /**
     * 
     */
    constructor() {
      super();

      this.taillePixel = 10;
      this.largeur = 50;
      this.hauteur = 50;

      this.state = "arrêt";
      this.animation = null;
      
      this.vitesse = 100;
      this.direction = "right";
      this.mySnake = [[Math.floor(this.largeur/2)*this.taillePixel,Math.floor(this.hauteur/2)*this.taillePixel],[Math.floor(this.largeur/2)*this.taillePixel+this.taillePixel,Math.floor(this.hauteur/2)*this.taillePixel]];
      this.bonbon = [10,10];

      this.root = this.attachShadow({ mode: 'open' });

      document.addEventListener('keyup',this.onKeyUp.bind(this));
    }

    /**
     * Fonction se chargeant au chargement du DOM.
     * Elle charge la base du jeu.
     */
    connectedCallback() { 

        if (window.innerWidth > 850 )
        {
            this.root.innerHTML = `${this.buildStyles()}
        <div id='corps'>
            <div id="score_block">
                <h3>Score :</h3><h3 id="score">0</h3>
            </div>
            <div id="lejeu">
                <canvas id='monjeu' height="${this.hauteur*this.taillePixel}px" width="${this.largeur*this.taillePixel}px"></canvas>
            </div>
        </div>`;
        
        this.init();
        }
    }

    /**
     * Fonction d'initialisation du jeu
     */
    init(){
        let myCanvas = document.querySelector('my-snake').shadowRoot.querySelector('#monjeu');
        let context = myCanvas.getContext("2d");

        context.font = '30px Arial';
        context.fillStyle = "#6ab04c";
        context.fillText('Cliques pour commencer !', 10, 50);

        this.PositionBonbon(myCanvas);

        myCanvas.addEventListener('click',this.animate.bind(this));

    }

    /**
     * Fonction qui génère la position du bonbon et vérifie qu'il ne soit pas sur le serpent.
     * @param {HTLMelement} myCanvas 
     */
    PositionBonbon(myCanvas)
    {
        this.bonbon = [Math.floor(Math.random() * ((Math.floor(this.largeur-2))+2))*this.taillePixel,Math.floor(Math.random() * ((Math.floor(this.largeur-2))+2))*this.taillePixel];

        /*if (this.bonbon[0]>myCanvas.width-this.taillePixel)
        {
            this.PositionBonbon(myCanvas);
        }
        else if (this.bonbon[1]>myCanvas.height-this.taillePixel)
        {
            this.PositionBonbon(myCanvas);
        }*/

        this.mySnake.forEach(element => {
            if (this.collision(element[0],element[1],this.bonbon[0],this.bonbon[1]))
            {
                this.PositionBonbon(myCanvas);
            }
        });
    }

    /**
     * Fonction qui traite le jeu
     */
    monCanvas(){
        let myCanvas = document.querySelector('my-snake').shadowRoot.querySelector('#monjeu');
        let context = myCanvas.getContext("2d");

        context.clearRect(0, 0, myCanvas.width, myCanvas.height);

        switch (this.direction) {
            case "right":
                this.mySnake.unshift([parseInt(this.mySnake[0][0])+this.taillePixel,parseInt(this.mySnake[0][1])]);
                break;
            case "left":
                this.mySnake.unshift([parseInt(this.mySnake[0][0])-this.taillePixel,parseInt(this.mySnake[0][1])]);
                break;        
            case "top":
                this.mySnake.unshift([parseInt(this.mySnake[0][0]),parseInt(this.mySnake[0][1])-this.taillePixel]);
                break;
            case "bottom":
                this.mySnake.unshift([parseInt(this.mySnake[0][0]),parseInt(this.mySnake[0][1])+this.taillePixel]);
                break;        
        }
        this.mySnake.pop();

        this.mySnake.forEach(element => {
            context.fillStyle = "#6ab04c";
            context.fillRect(parseInt(element[0]),parseInt(element[1]),this.taillePixel,this.taillePixel);
            context.fillStyle = "#2d3436";
            context.strokeRect(parseInt(element[0]),parseInt(element[1]),this.taillePixel,this.taillePixel);
        });

        context.fillStyle = "#f6e58d";
        context.fillRect((parseInt(this.bonbon[0])),parseInt(this.bonbon[1]),this.taillePixel,this.taillePixel);
        context.fillStyle = "#2d3436";
        context.strokeRect((parseInt(this.bonbon[0])),parseInt(this.bonbon[1]),this.taillePixel,this.taillePixel);

        //console.log(this.direction);

        if ((parseInt(this.mySnake[0][0]) < 0) || (parseInt(this.mySnake[0][0]) > myCanvas.width-1) || (parseInt(this.mySnake[0][1]) < 0) || (parseInt(this.mySnake[0][1]) > myCanvas.height-1)) 
        {
            this.state = "perdu";
            this.animate();
            context.clearRect(0, 0, myCanvas.width, myCanvas.height);
            context.font = '48px Arial';
            context.fillStyle = "#6ab04c";
            context.fillText('Tu as Perdu !!!', 10, 50);
            context.font = '30px Arial';
            context.fillText('Cliques pour Recommencer !', 10, 100);
            this.changerScore("restart");
            
            this.mySnake = [[Math.floor(this.largeur/2)*this.taillePixel,Math.floor(this.hauteur/2)*this.taillePixel],[Math.floor(this.largeur/2)*this.taillePixel+this.taillePixel,Math.floor(this.hauteur/2)*this.taillePixel]];
            this.direction = "right";
            this.state = "arrêt";
        }
        
        if(this.collision(this.mySnake[0][0],this.mySnake[0][1],this.bonbon[0],this.bonbon[1]))
        {
            this.mySnake.unshift([parseInt(this.mySnake[0][0]),parseInt(this.mySnake[0][1])]);
            
            this.PositionBonbon(myCanvas);
            context.fillStyle="#000000";
            context.fillRect((parseInt(this.bonbon[0])),parseInt(this.bonbon[1]),this.taillePixel,this.taillePixel);
            this.changerScore("ajout");
        }

        if (this.mySnake.length >= 5)
        {
            for(let index = 3; index < this.mySnake.length; index++) 
            {       
                if(this.collision(this.mySnake[index][0],this.mySnake[index][1],this.mySnake[0][0],this.mySnake[0][1]))
                {
                    this.state = "perdu";
                    this.animate();
                    context.clearRect(0, 0, myCanvas.width, myCanvas.height);
                    context.font = '48px Arial';
                    context.fillStyle = "#6ab04c";
                    context.fillText('Tu as Perdu !!!', 10, 50);
                    context.font = '30px Arial';
                    context.fillText('Cliques pour Recommencer !', 10, 100);
                    this.changerScore("restart");
            
                    this.mySnake = [[this.largeur/2,this.hauteur/2],[this.largeur/2+this.taillePixel,this.hauteur/2],[this.largeur/2+this.taillePixel*2,this.hauteur/2]];
                    this.direction = "right";
                    this.state = "arrêt";
                }
            }
        }
    }

    /**
     * Fonction qui examine la colision entre deux objets du jeu
     * @param {Number} objet1x Position x de l'objet 1
     * @param {Number} objet1y Position y de l'objet 1
     * @param {Number} objet2x Position x de l'objet 2
     * @param {Number} objet2y Position y de l'objet 2
     */
    collision(objet1x,objet1y,objet2x,objet2y)
    {
        /*if(objet1x < objet2x + this.taillePixel &&
            objet1x + this.taillePixel > objet2x &&
            objet1y < objet2y + this.taillePixel &&
            this.taillePixel + objet1y > objet2y){
            return true;
        }
        else{
            return false;
        }*/
        if(objet1x == objet2x && objet1y == objet2y){
            return true;
        }
        else{
            return false;
        }
    }
    /**
     * Fonction gérant la touche utilisée par l'utilisateur et la direction adéquate attribuée à la direction.
     * @param {KeyboardEvent} e évènement du Keyboard
     */

    onKeyUp (e) {
        if (this.state == "lancé")// si le jeu n'est pas perdu
        {
            switch (e.key) {
                case "ArrowUp":
                    if ((this.direction != "bottom") && (this.direction != "top"))
                    {
                        this.stateAction = true;
                        this.direction = "top";
                        this.animate();
                    }                   
                    break;
                case "ArrowDown":
                    if ((this.direction != "top") && (this.direction != "bottom"))
                    {
                        this.stateAction = true;
                        this.direction = "bottom";
                        this.animate();
                    }                  
                    break;
                case "ArrowLeft":
                    if ((this.direction != "right") && (this.direction != "left"))
                    {
                        this.stateAction = true;
                        this.direction = "left";
                        this.animate();
                    }       
                    break;
                case "ArrowRight":
                    if ((this.direction != "left") && (this.direction != "right"))
                    {
                        this.stateAction = true;
                        this.direction = "right";
                        this.animate();
                    }
                    break;
            }
        }
    }

    /**
     * Fonction gérant l'intervale de l'animation
     */
    animate()
    {
        switch (this.state) {
            case "arrêt":
                this.animation = setInterval(this.monCanvas.bind(this),this.vitesse);
                this.state = "lancé";
                break;
            case "lancé":
                clearInterval(this.animation);
                this.animation = setInterval(this.monCanvas.bind(this),this.vitesse-(Math.floor((this.mySnake.length))*2-20));
                break;
            case "perdu":
                clearInterval(this.animation);
                break;
        }
    }

    /**
     * fonction de mise à jour du score
     * @param {string} value possède deux valeurs ajout ou restard
     */
    changerScore(value){
        let monScore = document.querySelector('my-snake').shadowRoot.querySelector('h3#score');
        if (value == "ajout")
        {
            monScore.innerHTML = this.mySnake.length-2;
        }
        else 
        {
            monScore.innerHTML = 0 ;
        }
    }

    /**
     * Fonction de création du style du DOM Shadow
     */
    buildStyles() {
        return `<style>
        *
        {
            font-family: 'Press Start 2P', cursive;
        }
        #corps
        {
            display:flex;
            flex-direction:column;
            align-items:center;
            width:500px;
            margin:auto;
        }
        canvas
        {
            border:2px solid #6ab04c;
            position:relative;
            z-index:5;
            background:#2d3436;
        }
        #score_block
        {
            width:${this.taillePixel*this.largeur};
            text-align:center;
            background:#2d3436;
            color:#6ab04c;
            border:2px solid #6ab04c;
            border-bottom:0px;
        }
        h3{
          display:inline-block; 
          height:fit-content;
          padding:0 10px;
        }
        #lejeu
        {
            display:block;
        }
        </style>`;
    }
    /**
    * Extract an int from a string
    * @param {string} value "20px" "auto"
    * @param {number} initial default value
    * @param {number} min assign default value if the value is under this threshold
    */
   intFromPx(value, initial, min = 0) {
     if (value === null || value === undefined) {
       return initial
     }
     value = parseInt(value.replace('px', ''), 10)
     if (value > min) {
       return value
     }
     return initial
   }
}
/**
 * Définition de l'élément HTML Customisé My Snake
 */
try {
        customElements.define('my-snake', Snake)
      } catch (e) {
        if (e instanceof DOMException) {
          console.error('DOMException : ' + e.message);
        } else {
          throw e;
     }
}
