

class Painter {
  
  constructor(selectorId, width, height, pencilSelector = {
    colorPencil: '#pencilColor',
    colorPalette: '.color-palette',
    pencilSize: '#pencilSize',
    pencilOpacity: '#pencilOpacity',
    clearButton: '#clearButton',
    downloadButton: '#downloadButton',
    previewButton: '#previewButton',
    previewArea: '#preview',
  }) {
    this.selectorId = selectorId;
    this.width = width;
    this.height = height;

    this.pencilSelector = pencilSelector

    this.x = null;
    this.y = null;

    this.init();
  }

  /**
   * initialize function.
   */
  init = () => {
    this.element = document.getElementById(this.selectorId);
    this.clearButton = document.querySelector(this.pencilSelector.clearButton);
    this.downloadButton = document.querySelector(this.pencilSelector.downloadButton);
    this.previewButton = document.querySelector(this.pencilSelector.previewButton);
    this.previewArea = document.querySelector(this.pencilSelector.previewArea);

    if (this.element == null) {
      throw this.error('Selector is not found. Please specify the id.');
    }

    if (this.element.tagName !== 'CANVAS') {
      throw this.error(`${this.selectorId} is not canvas`);
    }

    this.element.width = this.width;
    this.element.height = this.height;

    this.element.addEventListener('mousemove', this.onMouseMove);
    this.element.addEventListener('mousedown', this.onMouseDown);
    this.element.addEventListener('mouseout', this.drawFinish);
    this.element.addEventListener('mouseup', this.drawFinish);

    if (this.clearButton != null) {
      this.clearButton.addEventListener('click', this.clearCanvas);
    }

    if (this.downloadButton != null) {
      this.downloadButton.addEventListener('click', this.download);
    }

    if (this.previewButton != null) {
      this.previewButton.addEventListener('click', this.preview);
    }

    if (this.previewArea != null) {
      this.previewArea.src = './image/no-preview.jpg';
      this.previewArea.width = this.width;
      this.previewArea.height = this.height;
    }



    this.context = this.element.getContext('2d');

    this.setCanvasStyle();

    // init pencil setting.
    this.penSize = 3;
    this.penColor = '#000000';
    this.penOpacity = 1;

    this.initColorPencilElements();
  }

  /**
   * Initialize colored pencils
   */
  initColorPencilElements = () => {
    const { colorPencil: color, colorPalette: palette, pencilSize: size, pencilOpacity: opacity } = this.pencilSelector;
    const colorPencil = document.querySelector(color);
    const colorPalette = document.querySelector(palette);
    const pencilSize = document.querySelector(size);
    const pencilOpacity = document.querySelector(opacity);

    if (colorPencil != null) {
      colorPencil.value = this.penColor;

      colorPencil.addEventListener('click', (ev) => {
        ev.target.type = 'color'
      });
      colorPencil.addEventListener('blur', (ev) => {
        ev.target.type = 'text';
        if (colorPalette != null) {
          colorPalette.style.backgroundColor = ev.target.value;
        }
      });
      colorPencil.addEventListener('change', (ev) => {
        this.penColor = ev.target.value;
      });
    }

    if (colorPalette != null) {
      colorPalette.style.backgroundColor = this.penColor;
    }

    if (pencilSize != null) {
      pencilSize.value = this.penSize;
      pencilSize.addEventListener('change', (ev) => {
        this.penSize = ev.target.value;
      });
    }

    if (pencilOpacity != null) {
      pencilOpacity.value = this.penOpacity;
      pencilOpacity.addEventListener('change', ev => {
        this.penOpacity = ev.target.value;
      });
    }
  }

  /**
   * set canvas style
   */
  setCanvasStyle = () => {
    this.element.style.border = '1px solid #778899';

    this.context.beginPath();
    this.context.fillStyle = "#f5f5f5";
    this.context.fillRect(0, 0, this.width, this.height);
  }

  /**
   * clear canvas
   */
  clearCanvas = () => {
    this.context.clearRect(0, 0, this.element.width, this.element.height);

    this.setCanvasStyle();
  }


  /**
   * download image.
   */
  download = () => {
    this.element.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const aTag = document.createElement('a');
      document.body.appendChild(aTag);
  
      aTag.download = 'drawImage.png';
      aTag.href = url;
      aTag.click();
      aTag.remove();
  
      URL.revokeObjectURL(url);
    });
  }

  /**
   * show preview
   */
  preview = () => {
    this.previewArea.src = this.element.toDataURL();

    this.previewArea.width = this.width;
    this.previewArea.height = this.height;
  }

  /**
   * Calculate the coordinates from the event.
   * @param {*} event 
   */
  calcCoordinate = (event) => {
    const rect = event.target.getBoundingClientRect();

    const x = ~~(event.clientX - rect.left);
    const y = ~~(event.clientY - rect.top);

    return {x, y};
  }

  /**
   * Throw a common error message.
   * @param {*} message 
   */
  error = (message) => {
    const error = new Error(`[painter.js] ${message}`);
    return error;
  }

  /**
   * mouse down event
   * @param {*} event 
   */
  onMouseDown = (event) => {
    if (event.button !== 0) {
      return;
    }
    const coordinate = this.calcCoordinate(event);
    this.draw(coordinate);
  }

  /**
   * mouse move event
   * @param {*} event 
   */
  onMouseMove = (event) => {
    if (event.buttons !== 1) {
      return;
    }
    const coordinate = this.calcCoordinate(event);
    this.draw(coordinate);
  }

  /**
   * End of drawing process.
   */
  drawFinish = () => {
    this.x = null;
    this.y = null;
  }

  /**
   * drawing process
   * @param {*} coordinate 
   */
  draw = (coordinate = {x: 0, y: 0}) => {
    const {x: toX, y: toY} = coordinate;
    this.context.beginPath();
    this.context.globalAlpha = this.penOpacity;

    const fromX = this.x || toX;
    const fromY = this.y || toY;

    this.context.moveTo(fromX, fromY);

    this.context.lineTo(toX, toY);

    this.context.lineCap = 'round';
    this.context.lineWidth =  this.penSize;
    this.context.strokeStyle = this.penColor;

    this.context.stroke();

    this.x = toX;
    this.y = toY;
  }
}

const painter = new Painter('canvasArea', 450, 407);
