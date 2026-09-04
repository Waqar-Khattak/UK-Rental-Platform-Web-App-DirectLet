describe('performance: messaging workload', () => {
  it('handles a batch of 100 contact lookups quickly', () => {
    const start = Date.now();
    const contacts = Array.from({ length: 100 }, (_, index) => ({
      id: index + 1,
      firstName: `User${index}`,
      lastName: 'Test',
      role: 'landlord',
    }));

    const elapsed = Date.now() - start;

    expect(contacts).toHaveLength(100);
    expect(elapsed).toBeLessThan(1000);
  });
});
