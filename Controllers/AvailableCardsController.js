const AvailableCards = require("../Models/AvailableCard");
const Governorate = require("../Models/Governorate");
const multer = require("../Config/Multer");

exports.createAvailableCard = async (req, res) => {
  try {
    const { governorate_id, name, location, mapslink, address, phone } = req.body || {};

    if (!governorate_id || !name || !location || !mapslink || !address || !phone) {
      return res.status(400).json({
        message: "Validation failed",
        errors: ["All fields are required"]
      });
    }

    const img = req.file ? req.file.filename : null;

    const newAvailableCard = await AvailableCards.create({ governorate_id, name, location, mapslink, address, phone, img });

    res.status(201).json({
      message: "Available Card created successfully",
      card: newAvailableCard
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create Available Card",
      errors: ["An error occurred while creating the Available Card. Please try again"]
    });
  }
};

exports.getAllAvailableCards = async (req, res) => {
  try {
    const availableCards = await AvailableCards.findAll({
      include: [{ model: Governorate, attributes: ['governorate'] }]
    });

    if (availableCards.length === 0) {
      return res.status(404).json({
        message: "No Available Cards found"
      });
    }

    res.status(200).json(availableCards);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve Available Cards",
      errors: ["An error occurred while retrieving the Available Cards. Please try again"]
    });
  }
};

exports.getAvailableCardById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const availableCard = await AvailableCards.findByPk(id, {
      include: [{ model: Governorate, as: "governorate", attributes: ['governorate'] }]
    });
    
    if (!availableCard) {
      return res.status(404).json({
        message: "Available Card not found",
      });
    }
    
    res.status(200).json({
      message: "Available Card retrieved successfully",
      data: availableCard,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve Available Card",
      errors: ["An error occurred while retrieving the Available Card. Please try again"],
    });
  }
};

exports.updateAvailableCard = async (req, res) => {
  const { id } = req.params;
  const { governorate_id, name, location, mapslink, address, phone } = req.body;

  try {
    if (!governorate_id || !name || !location || !mapslink || !address || !phone) {
      return res.status(400).json({
        message: "Validation failed",
        errors: ["All fields are required"]
      });
    }

    const img = req.file ? req.file.filename : null;

    const availableCard = await AvailableCards.findByPk(id);
    if (!availableCard) {
      return res.status(404).json({
        message: "Not Found",
        errors: ["No Available Card entry found with the given id"]
      });
    }

    availableCard.governorate_id = governorate_id || availableCard.governorate_id;
    availableCard.name = name || availableCard.name;
    availableCard.location = location || availableCard.location;
    availableCard.mapslink = mapslink || availableCard.mapslink;
    availableCard.address = address || availableCard.address;
    availableCard.phone = phone || availableCard.phone;
    if (img) availableCard.img = img;

    await availableCard.save();

    res.status(200).json({
      message: "Available Card updated successfully",
      availableCard
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to update Available Card",
      errors: ["An error occurred while updating the Available Card. Please try again"]
    });
  }
};

exports.deleteAvailableCard = async (req, res) => {
  try {
    const { id } = req.params;
    const availableCard = await AvailableCards.findByPk(id);
    if (!availableCard) {
      return res.status(404).json({
        message: "Available Card not found"
      });
    }

    await availableCard.destroy();

    res.status(200).json({
      message: "Available Card deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete Available Card",
      errors: ["An error occurred while deleting the Available Card. Please try again"]
    });
  }
};

exports.getAllGovernorates = async (req, res) => {
  try {
    const governorates = await Governorate.findAll();
    if (governorates.length === 0) {
      return res.status(404).json({
        message: "No Governorates found"
      });
    }
    res.status(200).json({
      message: "Governorates retrieved successfully",
      governorates
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve Governorates",
      errors: ["An error occurred while retrieving the Governorates. Please try again"]
    });
  }
};

exports.getAvailableCardBygovermentId = async (req, res) => {
  try {
    const { governorate_id } = req.params;

    const availableCards = await AvailableCards.findAll({
      where: { governorate_id }
    });

    if (availableCards.length === 0) {
      return res.status(404).json({
        message: "No Available Cards found for this Governorate"
      });
    }

    res.status(200).json({
      message: "Available Cards retrieved successfully",
      availableCards
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to retrieve Available Cards for the Governorate",
      errors: ["An error occurred while retrieving the Available Cards. Please try again"]
    });
  }
};

exports.createGovernorate = async (req, res) => {
  try {
    const { governorate } = req.body;
    if (!governorate) {
      return res.status(400).json({
        message: "Validation failed",
        errors: ["Governorate name is required"]
      });
    }
    
    const newGovernorate = await Governorate.create({ governorate });

    res.status(201).json({
      message: "Governorate created successfully",
      governorate: newGovernorate
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to create Governorate",
      errors: ["An error occurred while creating the Governorate. Please try again"]
    });
  }
};

exports.deleteGovernorate = async (req, res) => {
  try {
    const { id } = req.params;
    const governorate = await Governorate.findByPk(id);
    if (!governorate) {
      return res.status(404).json({
        message: "Governorate not found"
      });
    }

    await governorate.destroy();

    res.status(200).json({
      message: "Governorate deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed to delete Governorate",
      errors: ["An error occurred while deleting the Governorate. Please try again"]
    });
  }
};