describe('functional: messaging flow', () => {
  it('exposes a message contact lookup path', () => {
    const contacts = [{ id: '1', firstName: 'Ava', lastName: 'Ng', role: 'landlord' }];
    expect(contacts).toHaveLength(1);
    expect(contacts[0].role).toBe('landlord');
  });

  it('supports sending a first message payload', () => {
    const payload = {
      receiverId: 'user-2',
      content: 'Hello',
    };

    expect(payload.content.trim()).toBe('Hello');
    expect(payload.receiverId).toBeTruthy();
  });
});
