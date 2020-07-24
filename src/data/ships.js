class Ship {
  constructor (id) {
    this.id = id;
    this.coords = [];
    this.hits = new Array(+id.slice(0, 1)).fill('life');
    this.isVertical = false;
    this.isPlaced = false;
    this.isDestroyed = false
  }
};

const generateShipList = () => {
  const CompShipList = {
        deck4: [
          new Ship("4.0")
        ],
        deck3: [
          new Ship("3.0"), 
          new Ship("3.1")
        ],
        deck2: [
          new Ship("2.0"),
          new Ship("2.1"), 
          new Ship("2.2")
        ],
        deck1: [
          new Ship("1.0"),
          new Ship("1.1"),
          new Ship("1.2"),
          new Ship("1.3")
        ]
      };
      return CompShipList;
}; 

export default generateShipList;