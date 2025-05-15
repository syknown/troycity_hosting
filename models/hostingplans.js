module.exports = (sequelize, DataTypes) => {
  const HostingPlans = sequelize.define("HostingPlans", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    currency: {
      type: DataTypes.ENUM("USD", "KES"),
      allowNull: false,
    },
    per: {
      type: DataTypes.ENUM("month", "year"),
      allowNull: false,
    },
    offer: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    features: {
      type: DataTypes.JSON,
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    buttonClass: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "btn-primary",
    },
  });
  return HostingPlans;
};
