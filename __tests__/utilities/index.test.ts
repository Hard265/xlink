import { isoStringToCalender } from '../../utilities';

describe('timestamps', () => {
  it('should return a string', () => {
    const date = new Date().toISOString();

    const result = isoStringToCalender(date);
    expect(typeof result).toBe('string');
  });

  it('should return a string in the format "YYYY-MM-DD" is date is past a week', () => {
    const date = new Date('2023-03-15T10:00:00.000Z').toISOString();

    const result = isoStringToCalender(date);
    expect(result).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  it('should return a string in the format "dddd, h:mm A" or "dddd, h:mm A" is date is within a week', () => {
    const date = new Date('2024-04-05T10:00:00.000Z').toISOString();
    const result = isoStringToCalender(date);
    expect(result).toBe('Friday, 10:00AM');
  });

  it('should return a string in the format "dddd, h:mm A" or "dddd, h:mm A" is date is within a week', () => {
    const date = new Date('2024-04-14T10:00:00.000Z').toISOString();
    const result = isoStringToCalender(date);
    expect(result).toBe('Sunday, 10:00AM');
  });

  it('should return a string in the format "[Today], h:mm A" if date is the same day', () => {
    const date = new Date('2024-04-08T10:00:00.000Z').toISOString();
    const result = isoStringToCalender(date);
    expect(result).toBe('Today, 10:00AM');
  });
});
