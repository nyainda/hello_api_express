'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('organisation_user', {
      organisation_orgId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Organisations',
          key: 'orgId',
        },
        onDelete: 'CASCADE',
      },
      user_userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'userId',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('NOW()'),
      },
    });

    await queryInterface.addConstraint('organisation_user', {
      fields: ['organisation_orgId', 'user_userId'],
      type: 'primary key',
      name: 'organisation_user_pkey'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('organisation_user');
  }
};

