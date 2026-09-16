import pool from "../config/db.js";

export const getAssetIntelligence = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        a.asset_id,
        a.asset_tag,
        a.asset_name,
        a.purchase_cost,
        a.purchase_date,
        a.warranty_expiry,
        a.status,
        a.asset_condition,

        COUNT(DISTINCT mr.maintenance_id)
          AS maintenance_count,

        COUNT(DISTINCT CASE
          WHEN mr.maintenance_status NOT IN ('Resolved', 'Completed')
          THEN mr.maintenance_id
        END) AS open_maintenance_count,

        COUNT(DISTINCT al.allocation_id)
          AS allocation_count

      FROM assets a

      LEFT JOIN maintenance_requests mr
        ON a.asset_id = mr.asset_id

      LEFT JOIN asset_allocations al
        ON a.asset_id = al.asset_id

      GROUP BY
        a.asset_id

      ORDER BY
        a.asset_id;
    `);

    const assets = result.rows.map(asset => {

      let riskScore = 0;

      const maintenanceCount =
        Number(asset.maintenance_count);

      const openMaintenance =
        Number(asset.open_maintenance_count);

      const allocationCount =
        Number(asset.allocation_count);

      /* Maintenance risk */
      riskScore += maintenanceCount * 10;

      /* Open issues are more serious */
      riskScore += openMaintenance * 15;

      /* Frequently allocated assets have higher business impact */
      if (allocationCount >= 3) {
        riskScore += 10;
      }

      /* Asset condition */
      if (asset.asset_condition === "Poor") {
        riskScore += 25;
      } else if (asset.asset_condition === "Fair") {
        riskScore += 15;
      }

      /* Cap score */
      riskScore = Math.min(riskScore, 100);

      let riskLevel = "Low";

      if (riskScore >= 70) {
        riskLevel = "Critical";
      } else if (riskScore >= 40) {
        riskLevel = "Medium";
      }

      return {
        ...asset,
        risk_score: riskScore,
        risk_level: riskLevel
      };
    });

    res.json(assets);

  } catch (err) {
    console.error(
      "Asset Intelligence Error:",
      err
    );

    res.status(500).json({
      message: err.message
    });
  }
};