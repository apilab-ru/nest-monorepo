export class StringableObject {
  constructor(public data: object) {
  }

  toString(): string {
    return JSON.stringify(this.data);
  }
}
