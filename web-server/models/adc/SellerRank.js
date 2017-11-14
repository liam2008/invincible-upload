module.exports = {
    name: "SellerRank",
    schema: {
        _id: String,
        OperTime: Date,	        //
        SellerId: String,	    //
        SellerName: String,
        MonthRank: Number,
        YearRank: Number,
        LifetimeRank: Number,
        IsFba: Boolean,
        Growth: String,
        M1: Array,
        M3: Array,
        M12: Array,
        Lifetime: Array,
        From: String,
        TimeId: String
    }
};