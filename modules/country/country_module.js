const fetch = require("node-fetch"); // npm install node-fetch
const { response_sender } = require("../hooks/respose_sender");

// Countries fetch
const get_countries = async (req, res, next) => {
    try {
        const response = await fetch(
            'http://api.geonames.org/countryInfoJSON?username=brightfuturesoft'
        );
        const data = await response.json();
        const countries = data?.geonames?.map(country => ({
            value: country.geonameId,
            label: country.countryName,
        })) || [];
        
        return response_sender({
            res,
            status_code: 200,
            error: false,
            data: countries,
            message: "Countries fetched successfully",
        });
    } catch (error) {
        next(error);
    }
};

// Divisions fetch
const get_divisions = async (req, res, next) => {
    try {
        const { countryId } = req.query;
        if (!countryId) {
            return response_sender({
                res,
                status_code: 400,
                error: true,
                data: [],
                message: "Country ID is required",
            });
        }

        const response = await fetch(
            `http://api.geonames.org/childrenJSON?geonameId=${countryId}&username=brightfuturesoft`
        );
        const data = await response.json();
        const divisions = data?.geonames?.map(division => ({
            value: division.geonameId,
            label: division.name,
        })) || [];

        return response_sender({
            res,
            status_code: 200,
            error: false,
            data: divisions,
            message: "Divisions fetched successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    get_countries,
    get_divisions,
};
