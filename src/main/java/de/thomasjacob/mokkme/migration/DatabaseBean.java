package de.thomasjacob.mokkme.migration;

import java.util.List;


/**
 * @author Thomas
 */
public class DatabaseBean
{
	private int offset;

	private List<RowBean> rows;

	private int total_rows;

	public int getOffset()
	{
		return offset;
	}

	public List<RowBean> getRows()
	{
		return rows;
	}

	public int getTotal_rows()
	{
		return total_rows;
	}

	public void setOffset(int offset)
	{
		this.offset = offset;
	}

	public void setRows(List<RowBean> rows)
	{
		this.rows = rows;
	}

	public void setTotal_rows(int total_rows)
	{
		this.total_rows = total_rows;
	}
}
