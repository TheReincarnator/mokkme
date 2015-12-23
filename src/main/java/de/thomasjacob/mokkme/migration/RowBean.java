package de.thomasjacob.mokkme.migration;

/**
 * @author Thomas
 */
public class RowBean
{
	private DocumentBean doc;

	private String id;

	private String key;

	public DocumentBean getDoc()
	{
		return doc;
	}

	public String getId()
	{
		return id;
	}

	public String getKey()
	{
		return key;
	}

	public void setDoc(DocumentBean doc)
	{
		this.doc = doc;
	}

	public void setId(String id)
	{
		this.id = id;
	}

	public void setKey(String key)
	{
		this.key = key;
	}

}
