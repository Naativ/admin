describe('Login Test', function () {
  const mockUser = {
    tenant: '1006',
    email: 'jared.b.stevens@gmail.com',
    password: 'Password2'
  }

  it('Simple Login & Logout', function () {
    cy.visit('http://localhost:8080/')
    cy.get('[data-cy=\'Tenant Login Page\']').clear()
    cy.get('[data-cy=\'Tenant Login Page\']').type(mockUser.tenant)
    cy.get('[data-cy=\'Email Login Page\']').type(mockUser.email)
    cy.get('[data-cy=\'Password Login Page\']').type(mockUser.password)
    cy.get('[data-cy=\'Login Login Page\']').click()
    cy.get('[data-cy=\'Display Name\']').click()
    cy.get('[data-cy=\'Logout\']').click()
  })
})
