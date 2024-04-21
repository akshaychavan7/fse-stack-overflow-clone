import yake

def formal_keywords(keywords):
    """
    Formats keywords to use for tag generation.

    Args:
        keywords (list): List of keywords extracted from the text.

    Returns:
        list: Formatted list of keywords.

    Raises:
        Exception: If there is an error in sanitizing keywords.
    """
    try:
        for key in range(len(keywords)):
            if len(keywords[key].split()) > 1:
                keywords[key] = keywords[key].replace(' ', '-')
        return keywords
    except Exception as e:
        return Exception("Error in sanitizing keywords.")

def final_tags_gen(keywords, tags, finaltags):
    """
    Generate final tags based on keywords and existing tags.

    Args:
        keywords (list): List of keywords extracted from the text.
        tags (list): List of existing tags.
        finaltags (set): Set to store the final generated tags.

    Returns:
        set: Final generated tags.

    Raises:
        Exception: If there is an error in final tags generation.
    """
    try:
        for key in keywords:
            for tag in tags:
                if key in tag:
                    finaltags.add(tag)
        for key in keywords:
            if len(finaltags) == 5:
                break
            finaltags.add(key)
        return finaltags
    except Exception as e:
        return Exception("Error in final tags generation.")

def findtags(text, tags):
    """
    Find and generate tags based on text and existing tags.

    Args:
        text (str): Input text from which keywords are extracted.
        tags (list): List of existing tags.

    Returns:
        set: Final generated tags.

    Raises:
        Exception: If there is an error in finding and generating tags.
    """
    try:
        numkeywords = 20
        max_ngram_size = 2
        custom_kw_extractor = yake.KeywordExtractor(n=max_ngram_size, top=numkeywords)
        keywords = custom_kw_extractor.extract_keywords(text)
        keywords = [key[0].lower() for key in keywords]
        keywords = formal_keywords(keywords)
        finaltags = set()
        return final_tags_gen(keywords, tags, finaltags)
    except Exception as e:
        return Exception("Error in finding and generating tags.")