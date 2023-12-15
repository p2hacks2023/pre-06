export class Grade {
  name: string;
  minHotnessScore: number;
  color: [number, number, number]; // 0.0-1.0, RGB

  constructor(
    name: string,
    minHotnessScore: number,
    color: [number, number, number],
  ) {
    this.name = name;
    this.minHotnessScore = minHotnessScore;
    this.color = color;
  }
}

export class GradeList {
  grades: Grade[];

  constructor() {
    this.grades = [
      new Grade("イチゴ級", 0.0, [1.0, 0.4, 0.4]),
      new Grade("メロン級", 40.0, [0.6, 1, 0.4]),
      new Grade("ブルーハワイ級", 70.0, [0.4, 0.7, 1.0]),
    ];
  }

  getGrade(hotnessScore: number): Grade {
    let grade = this.grades[0];
    this.grades.forEach((g) => {
      if (hotnessScore >= g.minHotnessScore) {
        grade = g;
      }
    });
    return grade;
  }
}
