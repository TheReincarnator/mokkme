package de.thomasjacob.mokkme.migration;

import java.util.List;


/**
 * @author Thomas
 */
public class DocumentBean
{
	private String editId;

	private List<String> pages;

	private String viewId;

	public String getEditId()
	{
		return editId;
	}

	public List<String> getPages()
	{
		return pages;
	}

	public String getViewId()
	{
		return viewId;
	}

	public void setEditId(String editId)
	{
		this.editId = editId;
	}

	public void setPages(List<String> pages)
	{
		this.pages = pages;
	}

	public void setViewId(String viewId)
	{
		this.viewId = viewId;
	}
}
