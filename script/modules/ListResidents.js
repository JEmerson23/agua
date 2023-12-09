class ListResidents extends Array {
  constructor(...args){
    super(...args);
  }
  
  setResidents(names, order) {
    if (names.length == 0) {
        return;
    }
    
    const self = this;
    class Residents {
      constructor(names, order) {
        this.people = names || [];
        this.day = order || self.length || 1;
      }

      get order() {
        return this.day;
      }

      set order(n) {
        this.day = n;
      }
    }

    const newResidents = new Residents(names, order);

    self.push(newResidents);
    self.sort((a, b) => a.order - b.order);

    return this;
  }
  
  chooseResidents(distributionDay) {
    const chosen = this.find(
      residents => residents.order == distributionDay
    );

    return chosen;
  }
}

export default ListResidents;